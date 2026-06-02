const db = require('../../config/database');

class CmsController {
  async getPage(req, res, next) {
    try {
      const page = await db('cms_pages').where({ slug: req.params.slug, is_published: true }).first();
      if (!page) return res.status(404).json({ error: 'Page not found' });
      res.json({ data: page });
    } catch (error) { next(error); }
  }

  async updatePage(req, res, next) {
    try {
      const [page] = await db('cms_pages').where({ slug: req.params.slug })
        .update({ ...req.body, updated_at: new Date() }).returning('*');
      if (!page) {
        // Create if doesn't exist
        const [newPage] = await db('cms_pages').insert({
          ...req.body, slug: req.params.slug
        }).returning('*');
        return res.status(201).json({ data: newPage });
      }
      res.json({ data: page });
    } catch (error) { next(error); }
  }

  async getBanners(req, res, next) {
    try {
      const banners = await db('banners').where({ is_active: true }).orderBy('sort_order');
      res.json({ data: banners });
    } catch (error) { next(error); }
  }

  async createBanner(req, res, next) {
    try {
      const [banner] = await db('banners').insert(req.body).returning('*');
      res.status(201).json({ data: banner });
    } catch (error) { next(error); }
  }

  async updateBanner(req, res, next) {
    try {
      const [banner] = await db('banners').where({ id: req.params.id })
        .update({ ...req.body, updated_at: new Date() }).returning('*');
      if (!banner) return res.status(404).json({ error: 'Banner not found' });
      res.json({ data: banner });
    } catch (error) { next(error); }
  }

  async deleteBanner(req, res, next) {
    try {
      await db('banners').where({ id: req.params.id }).del();
      res.json({ message: 'Banner deleted' });
    } catch (error) { next(error); }
  }
}

module.exports = new CmsController();
