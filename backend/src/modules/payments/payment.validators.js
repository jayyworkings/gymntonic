const { body } = require('express-validator');

exports.paystackInitialize = [
  body('order_id').isInt().withMessage('Order ID is required and must be an integer'),
];

exports.cryptoInitialize = [
  body('order_id').isInt().withMessage('Order ID is required and must be an integer'),
  body('crypto_type').isIn(['btc', 'eth', 'usdt']).withMessage('Unsupported cryptocurrency'),
];

exports.cryptoConfirm = [
  body('reference').trim().notEmpty().withMessage('Reference is required'),
  body('tx_hash').trim().notEmpty().withMessage('Transaction hash is required'),
];
