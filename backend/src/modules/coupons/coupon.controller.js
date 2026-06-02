const db = require('../../config/database');

class CouponController {
  async getAll(req, res, next) {
    try {
      const coupons = await db('coupons').orderBy('created_at', 'desc');
      res.json({ data: coupons });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = { ...req.body, code: req.body.code.toUpperCase() };
      const [coupon] = await db('coupons').insert(data).returning('*');
      res.status(201).json({ data: coupon });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const [coupon] = await db('coupons').where({ id: req.params.id })
        .update({ ...req.body, updated_at: new Date() }).returning('*');
      if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
      res.json({ data: coupon });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await db('coupons').where({ id: req.params.id }).del();
      res.json({ message: 'Coupon deleted' });
    } catch (error) { next(error); }
  }

  async validate(req, res, next) {
    try {
      const coupon = await db('coupons')
        .where({ code: req.params.code.toUpperCase(), is_active: true })
        .where('valid_from', '<=', new Date())
        .where('valid_until', '>=', new Date())
        .first();
      if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon' });
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        return res.status(400).json({ error: 'Coupon usage limit reached' });
      }
      res.json({ data: coupon });
    } catch (error) { next(error); }
  }
}

module.exports = new CouponController();
