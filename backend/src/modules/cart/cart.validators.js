const { body } = require('express-validator');

exports.addItem = [
  body('product_id').isInt().withMessage('Product ID is required and must be an integer'),
  body('variant_id').optional({ nullable: true }).isInt().withMessage('Variant ID must be an integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

exports.updateItem = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

exports.applyCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
];
