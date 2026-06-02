const productRepository = require('./product.repository');
const db = require('../../config/database');

class ProductService {
  async getAllProducts(filters, pagination) {
    const { category, brand, min_price, max_price, featured, sort } = filters;
    const { limit, offset } = pagination;

    let query = db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('products.is_active', true);

    if (category) query = query.where('categories.slug', category);
    if (brand) query = query.where('products.brand', 'ilike', `%${brand}%`);
    if (min_price) query = query.where('products.price', '>=', parseFloat(min_price));
    if (max_price) query = query.where('products.price', '<=', parseFloat(max_price));
    if (featured === 'true') query = query.where('products.is_featured', true);

    const count = await productRepository.count(query);

    switch (sort) {
      case 'price_asc': query = query.orderBy('products.price', 'asc'); break;
      case 'price_desc': query = query.orderBy('products.price', 'desc'); break;
      case 'newest': query = query.orderBy('products.created_at', 'desc'); break;
      case 'bestselling': query = query.orderBy('products.total_sold', 'desc'); break;
      case 'rating': query = query.orderBy('products.average_rating', 'desc'); break;
      default: query = query.orderBy('products.created_at', 'desc');
    }

    const products = await productRepository.find(query, limit, offset);

    const productIds = products.map(p => p.id);
    if (productIds.length > 0) {
      const images = await productRepository.findImages(productIds);
      const imageMap = {};
      for (const img of images) imageMap[img.product_id] = img.url;
      for (const product of products) product.primary_image = imageMap[product.id] || null;
    }

    return { products, count };
  }

  async getProductBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    product.images = await db('product_images').where({ product_id: product.id }).orderBy('sort_order');
    product.variants = await db('product_variants').where({ product_id: product.id, is_active: true });
    
    return product;
  }

  async createProduct(data) {
    return productRepository.create(data);
  }

  async updateProduct(id, data) {
    const product = await productRepository.update(id, data);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  async deleteProduct(id) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return true;
  }
}

module.exports = new ProductService();
