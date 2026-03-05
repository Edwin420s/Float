const { body } = require('express-validator');

exports.walletAuthValidator = [
  body('address')
    .isLength({ min: 42, max: 42 })
    .withMessage('Invalid wallet address format')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Wallet address must start with 0x and be 42 characters long'),
  
  body('walletType')
    .optional()
    .isIn(['metamask', 'coinbase', 'walletconnect', 'metamask-demo', 'coinbase-demo', 'walletconnect-demo'])
    .withMessage('Invalid wallet type'),
  
  body('companyName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
];
