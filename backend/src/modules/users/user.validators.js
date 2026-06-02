const { body } = require('express-validator');

exports.updateProfile = [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
];

exports.changePassword = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/\d/).withMessage('New password must contain a number')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain a lowercase letter')
    .matches(/[!@#$%^&*]/).withMessage('New password must contain a special character'),
];

exports.addAddress = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('address_line1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('address_line2').optional().trim(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('phone').optional().trim(),
  body('is_default').optional().isBoolean(),
];

exports.updateAddress = [
  ...exports.addAddress.map(v => v.optional()),
];
