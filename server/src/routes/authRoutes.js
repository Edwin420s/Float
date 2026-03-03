const express = require('express');
const { authenticateWallet } = require('../controllers/authController');
const router = express.Router();

router.post('/wallet', authenticateWallet);

module.exports = router;