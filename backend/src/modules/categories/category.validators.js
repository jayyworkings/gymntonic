const { body } = require('express-validator');

exports.createCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('parent_id').optional({ nullable: true }).isInt().withMessage('Parent ID must be an integer'),
  body('sort_order').optional().isInt(),
];

exports.updateCategory = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('parent_id').optional({ nullable: true }).isInt().withMessage('Parent ID must be an integer'),
  body('sort_order').optional().isInt(),
];
