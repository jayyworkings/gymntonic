const router = require('express').Router();
const productController = require('./product.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./product.validators');
const upload = require('../../utils/upload');

router.get('/', productController.getAll);
router.get('/me/recently-viewed', productController.getRecentlyViewed);
router.get('/:slug', productController.getBySlug);
router.get('/:id/recommendations', productController.getRecommendations);

// Admin routes
router.get('/admin/export', authenticate, authorize('admin'), productController.exportCsv);
router.post('/', authenticate, authorize('admin'), validators.createProduct, validate, productController.create);
router.put('/:id', authenticate, authorize('admin'), validators.updateProduct, validate, productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);
router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 10), productController.uploadImages);

module.exports = router;
