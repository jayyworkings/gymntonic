const db = require('../../config/database');
const bcrypt = require('bcryptjs');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await db('users').where({ id: req.user.id })
        .select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'created_at').first();
      const addresses = await db('shipping_addresses').where({ user_id: req.user.id });
      res.json({ data: { ...user, addresses } });
    } catch (error) { next(error); }
  }

  async updateProfile(req, res, next) {
    try {
      const { first_name, last_name, phone } = req.body;
      const [user] = await db('users').where({ id: req.user.id })
        .update({ first_name, last_name, phone, updated_at: new Date() }).returning('*');
      const { password_hash, refresh_token, reset_token, ...safe } = user;
      res.json({ data: safe });
    } catch (error) { next(error); }
  }

  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      const user = await db('users').where({ id: req.user.id }).first();
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
      const hash = await bcrypt.hash(new_password, 12);
      await db('users').where({ id: req.user.id }).update({ password_hash: hash });
      res.json({ message: 'Password changed successfully' });
    } catch (error) { next(error); }
  }

  async addAddress(req, res, next) {
    try {
      const [address] = await db('shipping_addresses')
        .insert({ ...req.body, user_id: req.user.id }).returning('*');
      res.status(201).json({ data: address });
    } catch (error) { next(error); }
  }

  async updateAddress(req, res, next) {
    try {
      const [address] = await db('shipping_addresses')
        .where({ id: req.params.id, user_id: req.user.id })
        .update({ ...req.body, updated_at: new Date() }).returning('*');
      if (!address) return res.status(404).json({ error: 'Address not found' });
      res.json({ data: address });
    } catch (error) { next(error); }
  }

  async deleteAddress(req, res, next) {
    try {
      await db('shipping_addresses').where({ id: req.params.id, user_id: req.user.id }).del();
      res.json({ message: 'Address deleted' });
    } catch (error) { next(error); }
  }
}

module.exports = new UserController();
