const router = require('express').Router();
const controller = require('./category.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./category.validators');

router.get('/', controller.getAll);
router.get('/:slug', controller.getBySlug);
router.post('/', authenticate, authorize('admin'), validators.createCategory, validate, controller.create);
router.put('/:id', authenticate, authorize('admin'), validators.updateCategory, validate, controller.update);
router.delete('/:id', authenticate, authorize('admin'), controller.delete);

module.exports = router;
