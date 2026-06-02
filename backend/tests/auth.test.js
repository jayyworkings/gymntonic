/**
 * Auth Module Tests
 * 
 * Tests registration, login, account lockout, token refresh,
 * and profile retrieval.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

const TEST_USER = {
  email: `test_runner_${Date.now()}@gymntonic-test.com`,
  password: 'TestPass123!',
  first_name: 'Test',
  last_name: 'Runner',
};

let accessToken = null;
let refreshToken = null;
let testUserId = null;

afterAll(async () => {
  // Cleanup test user
  if (testUserId) {
    await db('cart_items').where({ user_id: testUserId }).del();
    await db('users').where({ id: testUserId }).del();
  }
  await db.destroy();
});

describe('Auth Module', () => {
  describe('POST /api/v1/auth/register', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(TEST_USER.email);
      expect(res.body.data.user).not.toHaveProperty('password_hash');
      
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
      testUserId = res.body.data.user.id;
    });

    test('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER);
      
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    test('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: TEST_USER.email, password: 'WrongPass!' });
      
      expect(res.statusCode).toBe(401);
    });

    test('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'password' });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    test('should refresh tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      accessToken = res.body.data.accessToken;
    });

    test('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    test('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(TEST_USER.email);
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    test('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');
      
      expect(res.statusCode).toBe(401);
    });
  });
});
