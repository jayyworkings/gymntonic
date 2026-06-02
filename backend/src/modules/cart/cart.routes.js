const router = require('express').Router();
const controller = require('./cart.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./cart.validators');

router.get('/', optionalAuth, controller.getCart);
router.post('/items', optionalAuth, validators.addItem, validate, controller.addItem);
router.put('/items/:id', optionalAuth, validators.updateItem, validate, controller.updateItem);
router.delete('/items/:id', optionalAuth, controller.removeItem);
router.post('/apply-coupon', authenticate, validators.applyCoupon, validate, controller.applyCoupon);

module.exports = router;
