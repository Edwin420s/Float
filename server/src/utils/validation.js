const { body, validationResult } = require('express-validator');

// Reusable validator for payments
exports.validatePayment = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isString(),
  body('recipient').notEmpty(),
  body('paymentMethod').isIn(['base', 'mpesa', 'airtel', 'mtn']),
];

// Middleware to check validation result
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};