const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/product.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const orderRoutes = require('./modules/orders/order.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const userRoutes = require('./modules/users/user.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const couponRoutes = require('./modules/coupons/coupon.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const cmsRoutes = require('./modules/cms/cms.routes');
const searchRoutes = require('./modules/search/search.routes');
const blogRoutes = require('./modules/blog/blog.routes');
const newsletterRoutes = require('./modules/newsletter/newsletter.routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Security ────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-Guest-Session-ID']
}));

// ─── Rate Limiting ───────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 min — appropriate for eCommerce browsing
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth-specific stricter rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many auth attempts, please try again later.' }
});
app.use('/api/v1/auth/', authLimiter);

// ─── Body Parsing ────────────────────────────────────────
// Paystack webhooks need raw body
app.use('/api/v1/payments/paystack/webhook', express.raw({ type: 'application/json', limit: '1mb' }));
app.use(express.json({ limit: '1mb' })); // Strict 1MB limit for JSON bodies
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── HTTPS Enforcement ───────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ─── Compression & Logging ───────────────────────────────
app.use(compression());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Static Files ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve the cloned frontend at the root level
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Serve the HTTrack CDN folders so that relative paths like ../cdn9.bigcommerce.com work perfectly
app.use('/cdn1.bigcommerce.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'cdn1.bigcommerce.com')));
app.use('/cdn2.bigcommerce.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'cdn2.bigcommerce.com')));
app.use('/cdn9.bigcommerce.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'cdn9.bigcommerce.com')));
app.use('/cdn10.bigcommerce.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'cdn10.bigcommerce.com')));
app.use('/cdn11.bigcommerce.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'cdn11.bigcommerce.com')));
app.use('/store.bbcomcdn.com', express.static(path.join(__dirname, '..', '..', 'frontend', 'store.bbcomcdn.com')));

// ─── API Routes (v1) ────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/coupons`, couponRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/cms`, cmsRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/blog`, blogRoutes);
app.use(`${API_PREFIX}/newsletter`, newsletterRoutes);

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ─── API Root ────────────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'GymNTonic eCommerce API v1',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      products: `${API_PREFIX}/products`,
      categories: `${API_PREFIX}/categories`,
      cart: `${API_PREFIX}/cart`,
      orders: `${API_PREFIX}/orders`,
      payments: `${API_PREFIX}/payments`,
      users: `${API_PREFIX}/users`,
      wishlist: `${API_PREFIX}/wishlist`,
      reviews: `${API_PREFIX}/reviews`,
      coupons: `${API_PREFIX}/coupons`,
      admin: `${API_PREFIX}/admin`,
      cms: `${API_PREFIX}/cms`,
      search: `${API_PREFIX}/search`,
    }
  });
});

app.get('/api/v1/trigger-seed', async (req, res) => {
  const db = require('./config/database');
  try {
    await db.migrate.latest();
    await db.seed.run();
    res.json({ message: 'Success' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// ─── Error Handling ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
