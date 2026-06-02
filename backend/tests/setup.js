/**
 * Jest Test Setup for GymNTonic API
 * 
 * WARNING: This runs the test suite against the LIVE development database.
 * Tests are designed to be non-destructive (they clean up after themselves).
 * 
 * TODO for production: Create a separate test database (e.g. gymntonic_test_db)
 * and override DB_NAME here to avoid any risk to production data.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Override to test env
process.env.NODE_ENV = 'test';

const db = require('../src/config/database');

// Shared test state
global.testState = {
  token: null,
  adminToken: null,
  userId: null,
  productId: null,
  orderId: null,
};

// After all tests, close DB connection
afterAll(async () => {
  await db.destroy();
});
