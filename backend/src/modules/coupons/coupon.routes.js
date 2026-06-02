const router = require('express').Router();
const controller = require('./coupon.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./coupon.validators');

router.get('/validate/:code', controller.validate);
router.get('/', authenticate, authorize('admin'), controller.getAll);
router.post('/', authenticate, authorize('admin'), validators.createCoupon, validate, controller.create);
router.put('/:id', authenticate, authorize('admin'), validators.updateCoupon, validate, controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

module.exports = router;
