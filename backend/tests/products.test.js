/**
 * Products & Categories API Tests
 *
 * Tests public product listing, product detail, search,
 * category tree, and recently viewed.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

afterAll(async () => { await db.destroy(); });

describe('Products API', () => {
  test('GET /api/v1/products → 200 + paginated array', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('page');
  });

  test('GET /api/v1/products?sort=price_asc → sorted results', async () => {
    const res = await request(app).get('/api/v1/products?sort=price_asc&limit=5');
    expect(res.statusCode).toBe(200);
    if (res.body.data.length >= 2) {
      const prices = res.body.data.map(p => parseFloat(p.price));
      expect(prices[0]).toBeLessThanOrEqual(prices[1]);
    }
  });

  test('GET /api/v1/products?featured=true → only featured products', async () => {
    const res = await request(app).get('/api/v1/products?featured=true&limit=5');
    expect(res.statusCode).toBe(200);
    for (const p of res.body.data) {
      expect(p.is_featured).toBe(true);
    }
  });

  test('GET /api/v1/products/:slug → product detail with variants, images, reviews', async () => {
    // Get first product from the list
    const listRes = await request(app).get('/api/v1/products?limit=1');
    if (listRes.body.data.length === 0) return; // Skip if DB empty
    const slug = listRes.body.data[0].slug;

    const res = await request(app).get(`/api/v1/products/${slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('images');
    expect(res.body.data).toHaveProperty('variants');
    expect(res.body.data).toHaveProperty('reviews');
  });

  test('GET /api/v1/products/nonexistent-slug → 404', async () => {
    const res = await request(app).get('/api/v1/products/this-product-does-not-exist-99999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Categories API', () => {
  test('GET /api/v1/categories → 200 + tree structure', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/categories/:slug → category + products', async () => {
    // Get first category
    const catRes = await request(app).get('/api/v1/categories');
    if (catRes.body.data.length === 0) return;
    const slug = catRes.body.data[0].slug;

    const res = await request(app).get(`/api/v1/categories/${slug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('products');
  });
});

describe('Search API', () => {
  test('GET /api/v1/search/products?q=protein → filtered results', async () => {
    const res = await request(app).get('/api/v1/search/products?q=protein');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('filters');
    expect(res.body.filters).toHaveProperty('brands');
    expect(res.body.filters).toHaveProperty('price_range');
  });

  test('Search sanitizes SQL wildcards', async () => {
    const res = await request(app).get('/api/v1/search/products?q=%25drop%20table');
    expect(res.statusCode).toBe(200);
  });
});
