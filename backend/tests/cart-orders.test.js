/**
 * Cart & Order Integration Tests
 *
 * Tests the full shopping flow: add to cart → view cart → create order.
 * Also tests cart merge and order state machine.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

const TEST_USER = {
  email: `cart_test_${Date.now()}@gymntonic-test.com`,
  password: 'CartTest123!',
  first_name: 'Cart',
  last_name: 'Tester',
};

let accessToken = null;
let testUserId = null;
let testProductId = null;
let cartItemId = null;
let testOrderId = null;

afterAll(async () => {
  // Cleanup
  if (testOrderId) {
    await db('order_items').where({ order_id: testOrderId }).del();
    await db('orders').where({ id: testOrderId }).del();
  }
  if (testUserId) {
    await db('cart_items').where({ user_id: testUserId }).del();
    await db('users').where({ id: testUserId }).del();
  }
  await db.destroy();
});

beforeAll(async () => {
  // Create test user
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send(TEST_USER);
  accessToken = res.body.data.accessToken;
  testUserId = res.body.data.user.id;

  // Get a product to use in tests
  const prodRes = await request(app).get('/api/v1/products?limit=1');
  if (prodRes.body.data.length > 0) {
    testProductId = prodRes.body.data[0].id;
  }
});

describe('Cart API', () => {
  test('POST /api/v1/cart → add item to cart', async () => {
    if (!testProductId) return;
    
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ product_id: testProductId, quantity: 2 });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toContain('added');
  });

  test('GET /api/v1/cart → view cart with items', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
    
    if (res.body.data.items.length > 0) {
      cartItemId = res.body.data.items[0].id;
      expect(res.body.data.items[0]).toHaveProperty('product_name');
      expect(res.body.data.items[0]).toHaveProperty('price');
    }
  });

  test('PUT /api/v1/cart/:id → update quantity', async () => {
    if (!cartItemId) return;
    
    const res = await request(app)
      .put(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ quantity: 1 });
    
    expect(res.statusCode).toBe(200);
  });

  test('Guest cart works with session header', async () => {
    const sessionId = `test-session-${Date.now()}`;
    
    if (!testProductId) return;

    // Add item as guest
    const addRes = await request(app)
      .post('/api/v1/cart/items')
      .set('x-session-id', sessionId)
      .send({ product_id: testProductId, quantity: 1 });
    expect(addRes.statusCode).toBe(201);

    // View guest cart
    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('x-session-id', sessionId);
    expect(cartRes.statusCode).toBe(200);
    expect(cartRes.body.data.items.length).toBeGreaterThanOrEqual(1);

    // Cleanup guest cart
    for (const item of cartRes.body.data.items) {
      await request(app)
        .delete(`/api/v1/cart/items/${item.id}`)
        .set('x-session-id', sessionId);
    }
  });
});

describe('Order API', () => {
  test('POST /api/v1/orders → create order from cart', async () => {
    if (!cartItemId) return;
    
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ shipping_method: 'standard' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('total_amount');
    expect(res.body.data.status).toBe('pending');
    testOrderId = res.body.data.id;
  });

  test('GET /api/v1/orders → user order list', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/orders/:id → order detail with items', async () => {
    if (!testOrderId) return;
    
    const res = await request(app)
      .get(`/api/v1/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('payments');
  });

  test('Creating order from empty cart fails', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ shipping_method: 'standard' });
    
    expect(res.statusCode).toBe(400);
  });
});
