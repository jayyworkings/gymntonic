const router = require('express').Router();
const controller = require('./wishlist.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, controller.add);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
