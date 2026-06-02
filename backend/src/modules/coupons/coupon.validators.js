const { body } = require('express-validator');

exports.createCoupon = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').toUpperCase(),
  body('discount_type').isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discount_value').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('min_order_amount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('max_discount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('valid_from').optional({ nullable: true }).isISO8601().toDate(),
  body('valid_until').optional({ nullable: true }).isISO8601().toDate(),
  body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }),
  body('is_active').optional().isBoolean(),
];

exports.updateCoupon = [
  body('code').optional().trim().notEmpty().toUpperCase(),
  body('discount_type').optional().isIn(['percentage', 'fixed']),
  body('discount_value').optional().isFloat({ min: 0 }),
  body('min_order_amount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('max_discount').optional({ nullable: true }).isFloat({ min: 0 }),
  body('valid_from').optional({ nullable: true }).isISO8601().toDate(),
  body('valid_until').optional({ nullable: true }).isISO8601().toDate(),
  body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }),
  body('is_active').optional().isBoolean(),
];
