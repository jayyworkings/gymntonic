const authService = require('./auth.service');
const db = require('../../config/database');

// Standalone helper to avoid `this` context issues with Express routing
async function mergeCart(req, userId) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId) return;

  const guestItems = await db('cart_items').where({ session_id: sessionId });
  if (guestItems.length === 0) return;

  for (const item of guestItems) {
    const existing = await db('cart_items').where({
      user_id: userId,
      product_id: item.product_id,
      variant_id: item.variant_id
    }).first();

    if (existing) {
      await db('cart_items').where({ id: existing.id }).update({
        quantity: existing.quantity + item.quantity,
        updated_at: new Date()
      });
      await db('cart_items').where({ id: item.id }).del();
    } else {
      await db('cart_items').where({ id: item.id }).update({
        user_id: userId,
        session_id: null,
        updated_at: new Date()
      });
    }
  }
}

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      await mergeCart(req, result.user.id);
      res.status(201).json({ message: 'Registration successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      await mergeCart(req, result.user.id);
      res.json({ message: 'Login successful', data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json({ message: 'Tokens refreshed', data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
