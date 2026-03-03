const { body } = require('express-validator');

exports.createPaymentValidator = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isString(),
  body('recipient').notEmpty().withMessage('Recipient is required'),
  body('paymentMethod').isIn(['base', 'mpesa', 'airtel', 'mtn']).withMessage('Invalid payment method'),
];