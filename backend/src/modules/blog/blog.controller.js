const db = require('../../config/database');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class BlogController {
  // GET /api/v1/blog
  async getAll(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const query = db('blog_posts').where({ is_published: true });

      const [{ count }] = await query.clone().clearSelect().count('id as count');
      const posts = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

      res.json({ data: posts, pagination: paginationMeta(parseInt(count), page, limit) });
    } catch (error) { next(error); }
  }

  // GET /api/v1/blog/:slug
  async getBySlug(req, res, next) {
    try {
      const post = await db('blog_posts').where({ slug: req.params.slug, is_published: true }).first();
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json({ data: post });
    } catch (error) { next(error); }
  }

  // POST /api/v1/blog (Admin)
  async create(req, res, next) {
    try {
      const [post] = await db('blog_posts').insert(req.body).returning('*');
      res.status(201).json({ data: post });
    } catch (error) { next(error); }
  }

  // PUT /api/v1/blog/:id (Admin)
  async update(req, res, next) {
    try {
      const [post] = await db('blog_posts').where({ id: req.params.id }).update({ ...req.body, updated_at: new Date() }).returning('*');
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json({ data: post });
    } catch (error) { next(error); }
  }

  // DELETE /api/v1/blog/:id (Admin)
  async delete(req, res, next) {
    try {
      const deleted = await db('blog_posts').where({ id: req.params.id }).del();
      if (!deleted) return res.status(404).json({ error: 'Post not found' });
      res.json({ message: 'Post deleted successfully' });
    } catch (error) { next(error); }
  }
}

module.exports = new BlogController();
