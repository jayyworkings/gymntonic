/**
 * GymNTonic API Client
 * Handles all communication with the backend API.
 */

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api/v1'
  : '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token') || null;
    this.user = JSON.parse(localStorage.getItem('user')) || null;
  }

  setToken(token, user) {
    this.token = token;
    this.user = user;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Dispatch event so UI can update
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
  }

  logout() {
    this.setToken(null, null);
    window.location.href = '/login.html';
  }

  async fetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Guest cart handling
    if (!this.token) {
      let sessionId = localStorage.getItem('guest_session_id');
      if (!sessionId) {
        sessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('guest_session_id', sessionId);
      }
      headers['X-Session-ID'] = sessionId;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.fetch(url);
  }

  async post(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this.fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this.fetch(endpoint, {
      method: 'DELETE',
    });
  }

  // --- API Modules ---

  auth = {
    login: async (email, password) => {
      const { data } = await this.post('/auth/login', { email, password });
      this.setToken(data.accessToken, data.user);
      return data;
    },
    register: async (userData) => {
      const { data } = await this.post('/auth/register', userData);
      this.setToken(data.accessToken, data.user);
      return data;
    },
    getProfile: () => this.get('/auth/me'),
  };

  products = {
    getAll: (params) => this.get('/products', params),
    getBySlug: (slug) => this.get(`/products/${slug}`),
  };

  categories = {
    getAll: () => this.get('/categories'),
    getBySlug: (slug) => this.get(`/categories/${slug}`),
  };

  cart = {
    get: () => this.get('/cart'),
    addItem: (product_id, quantity = 1, variant_id = null) => 
      this.post('/cart/items', { product_id, variant_id, quantity }),
    updateItem: (itemId, quantity) => 
      this.put(`/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId) => 
      this.delete(`/cart/items/${itemId}`),
    applyCoupon: (code) => 
      this.post('/cart/apply-coupon', { code }),
  };

  orders = {
    create: (orderData) => this.post('/orders', orderData),
    getUserOrders: (params) => this.get('/orders', params),
    getById: (id) => this.get(`/orders/${id}`),
  };

  payments = {
    initializePaystack: (order_id) => this.post('/payments/paystack/initialize', { order_id }),
    verifyPaystack: (reference) => this.get(`/payments/paystack/verify/${reference}`),
    initializeCrypto: (order_id, crypto_type) => this.post('/payments/crypto/initialize', { order_id, crypto_type }),
    confirmCrypto: (reference, txHash) => this.post('/payments/crypto/confirm', { reference, tx_hash: txHash }),
  };
}

// Global instance
window.api = new ApiClient();
