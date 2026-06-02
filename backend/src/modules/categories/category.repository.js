const db = require('../../config/database');

class CategoryRepository {
  async findAllActive() {
    return db('categories').where({ is_active: true }).orderBy('sort_order');
  }

  async findBySlug(slug) {
    return db('categories').where({ slug }).first();
  }

  async findProductsByCategoryId(categoryId) {
    return db('products')
      .where({ category_id: categoryId, is_active: true })
      .orderBy('created_at', 'desc');
  }

  async findSubcategories(parentId) {
    return db('categories').where({ parent_id: parentId, is_active: true });
  }

  async create(data) {
    const [category] = await db('categories').insert(data).returning('*');
    return category;
  }

  async update(id, data) {
    const [category] = await db('categories')
      .where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return category;
  }

  async delete(id) {
    return db('categories').where({ id }).del();
  }
}

module.exports = new CategoryRepository();
