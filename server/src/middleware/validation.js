const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg);
    next(new ValidationError(extractedErrors.join(', ')));
  };
};

const paymentValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isString(),
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('paymentMethod').isIn(['base', 'mpesa', 'airtel', 'mtn']).withMessage('Invalid payment method'),
];

module.exports = {
  validate,
  paymentValidation,
};