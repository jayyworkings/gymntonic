const productService = require('./product.service');
const db = require('../../config/database');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class ProductController {
  // GET /api/v1/products
  async getAll(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const { products, count } = await productService.getAllProducts(req.query, { limit, offset });
      
      res.json({
        data: products,
        pagination: paginationMeta(count, page, limit),
      });
    } catch (error) { next(error); }
  }

  // GET /api/v1/products/:slug
  async getBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);

      // Attach reviews (controller level because it uses review model)
      product.reviews = await db('reviews')
        .join('users', 'reviews.user_id', 'users.id')
        .select('reviews.*', 'users.first_name', 'users.last_name')
        .where({ product_id: product.id, is_approved: true })
        .orderBy('reviews.created_at', 'desc')
        .limit(10);

      // Record recently viewed
      const userId = req.user ? req.user.id : null;
      const sessionId = req.headers['x-session-id'];
      
      if (userId || sessionId) {
        const viewData = { user_id: userId, session_id: userId ? null : sessionId, product_id: product.id };
        const existingView = await db('recently_viewed').where(viewData).first();
        if (existingView) {
          await db('recently_viewed').where({ id: existingView.id }).update({ viewed_at: new Date() });
        } else {
          await db('recently_viewed').insert({ ...viewData, viewed_at: new Date() });
        }
      }

      res.json({ data: product });
    } catch (error) { next(error); }
  }

  // POST /api/v1/products (Admin)
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ data: product });
    } catch (error) { next(error); }
  }

  // PUT /api/v1/products/:id (Admin)
  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({ data: product });
    } catch (error) { next(error); }
  }

  // DELETE /api/v1/products/:id (Admin)
  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) { next(error); }
  }

  // GET /api/v1/products/me/recently-viewed
  async getRecentlyViewed(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const sessionId = req.headers['x-session-id'];
      
      const where = userId ? { 'recently_viewed.user_id': userId } : { 'recently_viewed.session_id': sessionId };
      if (!where['recently_viewed.user_id'] && !where['recently_viewed.session_id']) {
        return res.json({ data: [] });
      }

      const products = await db('recently_viewed')
        .join('products', 'recently_viewed.product_id', 'products.id')
        .select('products.*', 'recently_viewed.viewed_at')
        .where(where)
        .orderBy('recently_viewed.viewed_at', 'desc')
        .limit(10);

      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/:id/recommendations
  async getRecommendations(req, res, next) {
    try {
      const product = await db('products').where({ id: req.params.id }).first();
      if (!product) return res.status(404).json({ error: 'Product not found' });

      // Simple recommendation: other products in same category
      const products = await db('products')
        .where({ category_id: product.category_id, is_active: true })
        .whereNot({ id: product.id })
        .orderByRaw('RANDOM()')
        .limit(4);

      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products/:id/images (Admin)
  async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const images = req.files.map((file, index) => ({
        product_id: parseInt(req.params.id),
        url: `/uploads/${file.filename}`,
        alt_text: req.body.alt_text || '',
        is_primary: index === 0 && req.body.set_primary === 'true',
        sort_order: index,
      }));

      const inserted = await db('product_images').insert(images).returning('*');
      res.status(201).json({ data: inserted });
    } catch (error) {
      next(error);
    }
  }
  // GET /api/v1/products/admin/export (Admin)
  async exportCsv(req, res, next) {
    try {
      const products = await db('products')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select('products.*', 'categories.name as category_name');

      if (products.length === 0) {
        return res.status(404).json({ error: 'No products to export' });
      }

      const headers = Object.keys(products[0]).join(',');
      const rows = products.map(p => {
        return Object.values(p).map(v => {
          if (v === null || v === undefined) return '';
          const str = String(v).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',');
      });

      const csv = [headers, ...rows].join('\n');

      res.header('Content-Type', 'text/csv');
      res.attachment('products_export.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
