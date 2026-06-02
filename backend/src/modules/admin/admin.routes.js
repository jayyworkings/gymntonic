const router = require('express').Router();
const controller = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// Optional IP Whitelist middleware
const ipWhitelist = (req, res, next) => {
  const allowedIps = process.env.ADMIN_IP_WHITELIST ? process.env.ADMIN_IP_WHITELIST.split(',') : [];
  if (allowedIps.length > 0) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!allowedIps.includes(clientIp) && !allowedIps.includes('*')) {
      return res.status(403).json({ error: 'Access denied: IP not allowed' });
    }
  }
  next();
};

router.use(ipWhitelist, authenticate, authorize('admin'));

router.get('/dashboard', controller.dashboard);
router.get('/users', controller.getUsers);
router.put('/users/:id/role', controller.updateUserRole);
router.get('/analytics', controller.analytics);

module.exports = router;
