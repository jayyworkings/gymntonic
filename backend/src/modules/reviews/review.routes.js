const router = require('express').Router();
const controller = require('./review.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./review.validators');

router.get('/product/:productId', controller.getForProduct);
router.post('/', authenticate, validators.createReview, validate, controller.create);
router.put('/:id/moderate', authenticate, authorize('admin'), validators.updateReviewStatus, validate, controller.moderate);

module.exports = router;
