module.exports = {
  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  // Payment methods
  PAYMENT_METHOD: {
    PAYSTACK: 'paystack',
    CRYPTO_BTC: 'crypto_btc',
    CRYPTO_ETH: 'crypto_eth',
    CRYPTO_USDT: 'crypto_usdt',
  },

  // User roles
  ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};
