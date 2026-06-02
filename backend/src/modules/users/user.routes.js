const router = require('express').Router();
const controller = require('./user.controller');
const { authenticate } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./user.validators');

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, validators.updateProfile, validate, controller.updateProfile);
router.put('/password', authenticate, validators.changePassword, validate, controller.changePassword);
router.post('/addresses', authenticate, validators.addAddress, validate, controller.addAddress);
router.put('/addresses/:id', authenticate, validators.updateAddress, validate, controller.updateAddress);
router.delete('/addresses/:id', authenticate, controller.deleteAddress);

module.exports = router;
