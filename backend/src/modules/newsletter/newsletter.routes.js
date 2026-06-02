const router = require('express').Router();
const newsletterController = require('./newsletter.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin routes
router.get('/subscribers', authenticate, authorize('admin'), newsletterController.getSubscribers);

module.exports = router;
