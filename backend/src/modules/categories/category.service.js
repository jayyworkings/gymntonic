const categoryRepository = require('./category.repository');
const { slugify } = require('../../utils/helpers');

class CategoryService {
  buildTree(categories, parentId = null) {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({ ...c, children: this.buildTree(categories, c.id) }));
  }

  async getAllCategories() {
    const categories = await categoryRepository.findAllActive();
    return this.buildTree(categories);
  }

  async getCategoryBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });

    const products = await categoryRepository.findProductsByCategoryId(category.id);
    const subcategories = await categoryRepository.findSubcategories(category.id);

    return { ...category, products, subcategories };
  }

  async createCategory(data) {
    const categoryData = { ...data, slug: slugify(data.name) };
    return categoryRepository.create(categoryData);
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.update(id, data);
    if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    return category;
  }

  async deleteCategory(id) {
    await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
