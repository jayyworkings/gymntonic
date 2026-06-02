const { body } = require('express-validator');

exports.createOrder = [
  body('shipping_address_id').optional({ nullable: true }).isInt().withMessage('Shipping address ID must be an integer'),
  body('shipping_method').optional().trim(),
  body('coupon_code').optional().trim(),
  body('notes').optional().trim(),
];

exports.updateStatus = [
  body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']).withMessage('Invalid order status'),
  body('tracking_number').optional().trim(),
];
