const router = require('express').Router();
const controller = require('./order.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./order.validators');

router.post('/', authenticate, validators.createOrder, validate, controller.create);
router.get('/', authenticate, controller.getUserOrders);
router.get('/admin/all', authenticate, authorize('admin'), controller.getAllOrders);
router.get('/:id', authenticate, controller.getById);
router.put('/:id/status', authenticate, authorize('admin'), validators.updateStatus, validate, controller.updateStatus);

module.exports = router;
