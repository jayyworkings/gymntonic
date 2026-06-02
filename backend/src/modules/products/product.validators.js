const { body } = require('express-validator');

exports.createProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('brand').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('is_active').optional().isBoolean(),
];

exports.updateProduct = [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('is_active').optional().isBoolean(),
];
