/**
 * Health & Smoke Tests
 * 
 * Verifies that the API boots correctly, all route groups are mounted,
 * and basic connectivity works.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

afterAll(async () => { await db.destroy(); });

describe('Health & Smoke Tests', () => {
  test('GET /api/health → 200 + healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api/v1 → 200 + API root with endpoints list', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('GymNTonic');
    expect(res.body.endpoints).toHaveProperty('auth');
    expect(res.body.endpoints).toHaveProperty('products');
    expect(res.body.endpoints).toHaveProperty('orders');
  });

  test('GET /api/v1/nonexistent → 404 not found', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('Database is reachable', async () => {
    const result = await db.raw('SELECT 1 as connected');
    expect(result.rows[0].connected).toBe(1);
  });
});
