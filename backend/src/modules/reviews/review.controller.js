const db = require('../../config/database');

class ReviewController {
  async getForProduct(req, res, next) {
    try {
      const reviews = await db('reviews')
        .join('users', 'reviews.user_id', 'users.id')
        .select('reviews.*', 'users.first_name', 'users.last_name')
        .where({ product_id: req.params.productId, is_approved: true })
        .orderBy('reviews.created_at', 'desc');
      res.json({ data: reviews });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const { product_id, rating, title, body } = req.body;
      if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

      const [review] = await db('reviews').insert({
        user_id: req.user.id, product_id, rating, title, body
      }).returning('*');

      // Update product average rating
      const stats = await db('reviews').where({ product_id, is_approved: true })
        .avg('rating as avg').count('id as count').first();
      await db('products').where({ id: product_id }).update({
        average_rating: parseFloat(stats.avg) || 0,
        review_count: parseInt(stats.count) || 0,
      });

      res.status(201).json({ data: review });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'You already reviewed this product' });
      next(error);
    }
  }

  // Admin: approve/reject review
  async moderate(req, res, next) {
    try {
      const [review] = await db('reviews').where({ id: req.params.id })
        .update({ is_approved: req.body.is_approved, updated_at: new Date() }).returning('*');
      if (!review) return res.status(404).json({ error: 'Review not found' });

      // Recalculate product rating
      const stats = await db('reviews').where({ product_id: review.product_id, is_approved: true })
        .avg('rating as avg').count('id as count').first();
      await db('products').where({ id: review.product_id }).update({
        average_rating: parseFloat(stats.avg) || 0,
        review_count: parseInt(stats.count) || 0,
      });

      res.json({ data: review });
    } catch (error) { next(error); }
  }
}

module.exports = new ReviewController();
