const express = require('express');
const { connectWallet, loginWallet } = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { walletAuthValidator } = require('../validators/authValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// POST /api/auth/connect - Connect wallet for first time
router.post('/connect', validate(walletAuthValidator), asyncHandler(connectWallet));

// POST /api/auth/login - Login existing wallet
router.post('/login', validate(walletAuthValidator), asyncHandler(loginWallet));

module.exports = router;