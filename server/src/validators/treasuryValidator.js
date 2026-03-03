const { body } = require('express-validator');

exports.updateTreasuryValidator = [
  body('reservePercentage').optional().isFloat({ min: 0, max: 100 }),
  body('operationsPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('smartRules').optional().isArray(),
];