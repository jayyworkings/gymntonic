const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../config/database');
const authRepository = require('./auth.repository');
const { sendEmail } = require('../../utils/email');

class AuthService {
  generateTokens(user) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  sanitizeUser(user) {
    const { password_hash, refresh_token, reset_token, reset_token_expires, ...safe } = user;
    return safe;
  }

  async register({ email, password, first_name, last_name, phone }) {
    // Check if user exists
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await authRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);
    await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (!user.is_active) {
      throw Object.assign(new Error('Account is deactivated'), { statusCode: 403 });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw Object.assign(new Error('Account locked due to too many failed attempts. Try again later.'), { statusCode: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 minutes
      }
      await db('users').where({ id: user.id }).update({ failed_login_attempts: attempts, locked_until: lockedUntil });
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    // Reset failed attempts on successful login
    await db('users').where({ id: user.id }).update({ failed_login_attempts: 0, locked_until: null });

    const tokens = this.generateTokens(user);
    await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(token) {
    if (!token) {
      throw Object.assign(new Error('Refresh token required'), { statusCode: 400 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await authRepository.findById(decoded.id);

      if (!user || user.refresh_token !== token) {
        throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
      }

      const tokens = this.generateTokens(user);
      await authRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error.statusCode) throw error;
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }
  }

  async forgotPassword(email) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If an account exists, a reset email has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.updateResetToken(user.id, hashedToken, expires);

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - GymNTonic',
      html: `
        <p>Hi ${user.first_name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    return { message: 'If an account exists, a reset email has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findByResetToken(hashedToken);
    if (!user) {
      throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await authRepository.updatePassword(user.id, password_hash);

    return { message: 'Password reset successfully.' };
  }

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return this.sanitizeUser(user);
  }
}

module.exports = new AuthService();
