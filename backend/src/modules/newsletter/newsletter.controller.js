const db = require('../../config/database');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class NewsletterController {
  // POST /api/v1/newsletter/subscribe
  async subscribe(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      // Upsert subscriber
      const existing = await db('newsletter_subscribers').where({ email }).first();
      if (existing) {
        if (!existing.is_active) {
          await db('newsletter_subscribers').where({ id: existing.id }).update({ is_active: true, updated_at: new Date() });
        }
      } else {
        await db('newsletter_subscribers').insert({ email, is_active: true });
      }

      res.status(200).json({ message: 'Successfully subscribed to the newsletter' });
    } catch (error) { next(error); }
  }

  // POST /api/v1/newsletter/unsubscribe
  async unsubscribe(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      await db('newsletter_subscribers').where({ email }).update({ is_active: false, updated_at: new Date() });
      res.status(200).json({ message: 'Successfully unsubscribed from the newsletter' });
    } catch (error) { next(error); }
  }

  // GET /api/v1/newsletter/subscribers (Admin)
  async getSubscribers(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const query = db('newsletter_subscribers').where({ is_active: true });

      const [{ count }] = await query.clone().clearSelect().count('id as count');
      const subscribers = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

      res.json({ data: subscribers, pagination: paginationMeta(parseInt(count), page, limit) });
    } catch (error) { next(error); }
  }
}

module.exports = new NewsletterController();
