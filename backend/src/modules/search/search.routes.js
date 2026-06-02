const router = require('express').Router();
const controller = require('./search.controller');
const { validate } = require('../../middleware/validate');
const validators = require('./search.validators');

router.get('/products', validators.searchProducts, validate, controller.searchProducts);

module.exports = router;
