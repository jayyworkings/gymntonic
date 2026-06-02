const { body } = require('express-validator');

exports.createReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title').optional().trim(),
  body('body').optional().trim(),
];

exports.updateReviewStatus = [
  body('is_approved').isBoolean().withMessage('is_approved must be a boolean'),
];
