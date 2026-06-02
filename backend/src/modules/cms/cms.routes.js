const router = require('express').Router();
const controller = require('./cms.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const validators = require('./cms.validators');

router.get('/pages/:slug', controller.getPage);
router.put('/pages/:slug', authenticate, authorize('admin'), validators.updatePage, validate, controller.updatePage);
router.get('/banners', controller.getBanners);
router.post('/banners', authenticate, authorize('admin'), validators.createBanner, validate, controller.createBanner);
router.put('/banners/:id', authenticate, authorize('admin'), validators.updateBanner, validate, controller.updateBanner);
router.delete('/banners/:id', authenticate, authorize('admin'), controller.deleteBanner);

module.exports = router;
