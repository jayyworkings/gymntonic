const db = require('../../config/database');

class ProductRepository {
  async count(queryBuilder) {
    const [{ count }] = await queryBuilder.clone().clearSelect().count('products.id as count');
    return parseInt(count);
  }

  async find(queryBuilder, limit, offset) {
    return queryBuilder.limit(limit).offset(offset);
  }

  async findImages(productIds) {
    return db('product_images')
      .whereIn('product_id', productIds)
      .where({ is_primary: true });
  }

  async findBySlug(slug) {
    return db('products')
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .select('products.*', 'categories.name as category_name', 'categories.slug as category_slug')
      .where('products.slug', slug)
      .first();
  }

  async findById(id) {
    return db('products').where({ id }).first();
  }

  async create(data) {
    const [product] = await db('products').insert(data).returning('*');
    return product;
  }

  async update(id, data) {
    const [product] = await db('products').where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return product;
  }

  async delete(id) {
    return db('products').where({ id }).del();
  }
}

module.exports = new ProductRepository();
