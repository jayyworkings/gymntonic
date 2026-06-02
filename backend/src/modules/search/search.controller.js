const db = require('../../config/database');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class SearchController {
  async searchProducts(req, res, next) {
    try {
      const { q, category, min_price, max_price, brand, sort } = req.query;
      const { page, limit, offset } = parsePagination(req.query);

      let query = db('products')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select(
          'products.*',
          'categories.name as category_name',
          'categories.slug as category_slug'
        )
        .where('products.is_active', true);

      // Full-text search
      if (q) {
        const sanitizedQ = q.replace(/[%_]/g, '\\$&'); // Escape SQL wildcards
        query = query.where(function () {
          this.where('products.name', 'ilike', `%${sanitizedQ}%`)
            .orWhere('products.description', 'ilike', `%${sanitizedQ}%`)
            .orWhere('products.brand', 'ilike', `%${sanitizedQ}%`);
        });
      }

      // Filters
      if (category) query = query.where('categories.slug', category);
      if (brand) query = query.where('products.brand', 'ilike', `%${brand}%`);
      if (min_price) query = query.where('products.price', '>=', parseFloat(min_price));
      if (max_price) query = query.where('products.price', '<=', parseFloat(max_price));

      // Count
      const [{ count }] = await query.clone().clearSelect().count('products.id as count');

      // Sort
      switch (sort) {
        case 'price_asc': query = query.orderBy('products.price', 'asc'); break;
        case 'price_desc': query = query.orderBy('products.price', 'desc'); break;
        case 'newest': query = query.orderBy('products.created_at', 'desc'); break;
        case 'rating': query = query.orderBy('products.average_rating', 'desc'); break;
        case 'popular': query = query.orderBy('products.total_sold', 'desc'); break;
        default: query = query.orderBy('products.created_at', 'desc');
      }

      const products = await query.limit(limit).offset(offset);

      // Get available filters
      const brands = await db('products')
        .where({ is_active: true })
        .whereNotNull('brand')
        .distinct('brand')
        .orderBy('brand');

      const priceRange = await db('products')
        .where({ is_active: true })
        .min('price as min')
        .max('price as max')
        .first();

      res.json({
        data: products,
        filters: {
          brands: brands.map(b => b.brand),
          price_range: priceRange,
        },
        pagination: paginationMeta(parseInt(count), page, limit),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
