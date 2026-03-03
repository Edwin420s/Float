const express = require('express');
const { authenticateWallet } = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/wallet', asyncHandler(authenticateWallet));

module.exports = router;