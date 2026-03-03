const express = require('express');
const { createPayment, getPaymentHistory, receiveX402Payment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { createPaymentValidator } = require('../validators/paymentValidator');
const { validate } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', authMiddleware, validate(createPaymentValidator), asyncHandler(createPayment));
router.get('/history', authMiddleware, asyncHandler(getPaymentHistory));
router.post('/x402', asyncHandler(receiveX402Payment)); // no auth for demo

module.exports = router;