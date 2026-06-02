const { body } = require('express-validator');

exports.updatePage = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim(),
  body('meta_title').optional().trim(),
  body('meta_description').optional().trim(),
  body('is_published').optional().isBoolean(),
];

exports.createBanner = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subtitle').optional().trim(),
  body('image_url').trim().notEmpty().withMessage('Image URL is required'),
  body('link_url').optional().trim(),
  body('button_text').optional().trim(),
  body('sort_order').optional().isInt(),
  body('is_active').optional().isBoolean(),
];

exports.updateBanner = [
  body('title').optional().trim().notEmpty(),
  body('subtitle').optional().trim(),
  body('image_url').optional().trim().notEmpty(),
  body('link_url').optional().trim(),
  body('button_text').optional().trim(),
  body('sort_order').optional().isInt(),
  body('is_active').optional().isBoolean(),
];
