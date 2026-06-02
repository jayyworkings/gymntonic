const db = require('../../config/database');

class AuthRepository {
  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async create(userData) {
    const [user] = await db('users').insert(userData).returning('*');
    return user;
  }

  async updateRefreshToken(userId, token) {
    return db('users').where({ id: userId }).update({ refresh_token: token });
  }

  async updateResetToken(userId, token, expires) {
    return db('users').where({ id: userId }).update({
      reset_token: token,
      reset_token_expires: expires,
    });
  }

  async updatePassword(userId, passwordHash) {
    return db('users').where({ id: userId }).update({
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires: null,
    });
  }

  async findByResetToken(token) {
    return db('users')
      .where({ reset_token: token })
      .where('reset_token_expires', '>', new Date())
      .first();
  }
}

module.exports = new AuthRepository();
