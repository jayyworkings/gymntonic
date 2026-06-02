const db = require('../../config/database');

class WishlistController {
  async getAll(req, res, next) {
    try {
      const items = await db('wishlists')
        .join('products', 'wishlists.product_id', 'products.id')
        .leftJoin('product_images', function () {
          this.on('products.id', '=', 'product_images.product_id')
            .andOn('product_images.is_primary', '=', db.raw('true'));
        })
        .select('wishlists.id', 'products.id as product_id', 'products.name', 'products.slug',
          'products.price', 'products.retail_price', 'products.stock_quantity',
          'product_images.url as image_url', 'wishlists.created_at')
        .where({ 'wishlists.user_id': req.user.id });
      res.json({ data: items });
    } catch (error) { next(error); }
  }

  async add(req, res, next) {
    try {
      await db('wishlists').insert({ user_id: req.user.id, product_id: req.body.product_id });
      res.status(201).json({ message: 'Added to wishlist' });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Already in wishlist' });
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await db('wishlists').where({ id: req.params.id, user_id: req.user.id }).del();
      res.json({ message: 'Removed from wishlist' });
    } catch (error) { next(error); }
  }
}

module.exports = new WishlistController();
