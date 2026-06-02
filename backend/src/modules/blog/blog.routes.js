const router = require('express').Router();
const blogController = require('./blog.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.get('/', blogController.getAll);
router.get('/:slug', blogController.getBySlug);

// Admin routes
router.post('/', authenticate, authorize('admin'), blogController.create);
router.put('/:id', authenticate, authorize('admin'), blogController.update);
router.delete('/:id', authenticate, authorize('admin'), blogController.delete);

module.exports = router;
