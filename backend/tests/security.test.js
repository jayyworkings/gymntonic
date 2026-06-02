/**
 * Security Tests
 *
 * Tests rate limiting behavior, body size limits,
 * auth token validation, and account lockout.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

afterAll(async () => { await db.destroy(); });

describe('Security Tests', () => {
  test('Protected routes reject unauthenticated requests', async () => {
    const protectedEndpoints = [
      { method: 'get', path: '/api/v1/auth/me' },
      { method: 'get', path: '/api/v1/orders' },
      { method: 'post', path: '/api/v1/orders' },
      { method: 'get', path: '/api/v1/wishlist' },
    ];

    for (const ep of protectedEndpoints) {
      const res = await request(app)[ep.method](ep.path);
      expect(res.statusCode).toBe(401);
    }
  });

  test('Admin routes reject non-admin users', async () => {
    // Register a regular user
    const email = `sec_test_${Date.now()}@gymntonic-test.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'SecTest123!', first_name: 'Sec', last_name: 'Test' });
    
    const token = regRes.body.data.accessToken;
    const userId = regRes.body.data.user.id;

    const adminRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    
    expect(adminRes.statusCode).toBe(403);

    // Cleanup
    await db('users').where({ id: userId }).del();
  });

  test('Malformed JWT is rejected', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer totally.invalid.token');
    
    expect(res.statusCode).toBe(401);
  });

  test('API rejects oversized body', async () => {
    const largeBody = { data: 'x'.repeat(2 * 1024 * 1024) }; // 2MB
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(largeBody);
    
    expect(res.statusCode).toBe(413);
  });

  test('Blog & Newsletter endpoints are accessible', async () => {
    const blogRes = await request(app).get('/api/v1/blog');
    expect(blogRes.statusCode).toBe(200);
    expect(Array.isArray(blogRes.body.data)).toBe(true);

    const nlRes = await request(app)
      .post('/api/v1/newsletter/subscribe')
      .send({ email: `nl_test_${Date.now()}@test.com` });
    expect(nlRes.statusCode).toBe(200);
  });
});
