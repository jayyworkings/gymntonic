const categoryService = require('./category.service');

const categoryController = {
  async getAll(req, res, next) {
    try {
      const tree = await categoryService.getAllCategories();
      res.json({ data: tree });
    } catch (error) { next(error); }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await categoryService.getCategoryBySlug(req.params.slug);
      res.json({ data });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ data: category });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.json({ data: category });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ message: 'Category deleted' });
    } catch (error) { next(error); }
  },
};

module.exports = categoryController;
