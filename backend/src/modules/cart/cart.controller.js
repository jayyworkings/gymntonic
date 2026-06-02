const cartService = require('./cart.service');

class CartController {
  async getCart(req, res, next) {
    try {
      const where = req.user ? { user_id: req.user.id } : { session_id: req.headers['x-guest-session-id'] || req.headers['x-session-id'] };
      const cart = await cartService.getCart(where);
      res.json({ data: cart });
    } catch (error) { next(error); }
  }

  async addItem(req, res, next) {
    try {
      const whereCondition = req.user ? { user_id: req.user.id } : { session_id: req.headers['x-guest-session-id'] || req.headers['x-session-id'] };
      await cartService.addItem(req.body, whereCondition);
      res.status(201).json({ message: 'Item added to cart' });
    } catch (error) { next(error); }
  }

  async updateItem(req, res, next) {
    try {
      const whereCondition = req.user ? { user_id: req.user.id } : { session_id: req.headers['x-guest-session-id'] || req.headers['x-session-id'] };
      if (!whereCondition.user_id && !whereCondition.session_id) return res.status(401).json({ error: 'Unauthorized' });
      await cartService.updateItem(req.params.id, req.body.quantity, whereCondition);
      res.json({ message: 'Cart updated' });
    } catch (error) { next(error); }
  }

  async removeItem(req, res, next) {
    try {
      const whereCondition = req.user ? { user_id: req.user.id } : { session_id: req.headers['x-guest-session-id'] || req.headers['x-session-id'] };
      if (!whereCondition.user_id && !whereCondition.session_id) return res.status(401).json({ error: 'Unauthorized' });
      await cartService.removeItem(req.params.id, whereCondition);
      res.json({ message: 'Item removed from cart' });
    } catch (error) { next(error); }
  }

  async applyCoupon(req, res, next) {
    try {
      const coupon = await cartService.applyCoupon(req.body.code);
      res.json({ data: coupon });
    } catch (error) { next(error); }
  }
}

module.exports = new CartController();
