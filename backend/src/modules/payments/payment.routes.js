const router = require('express').Router();
const controller = require('./payment.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./payment.validators');

router.post('/paystack/initialize', authenticate, validators.paystackInitialize, validate, controller.paystackInitialize);
router.get('/paystack/verify/:reference', authenticate, controller.paystackVerify);
router.post('/paystack/webhook', controller.paystackWebhook);
router.post('/crypto/initialize', authenticate, validators.cryptoInitialize, validate, controller.cryptoInitialize);
router.post('/crypto/confirm', authenticate, authorize('admin'), validators.cryptoConfirm, validate, controller.cryptoConfirm);

module.exports = router;
