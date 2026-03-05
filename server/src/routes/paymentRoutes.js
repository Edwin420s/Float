const express = require('express');
const { 
  createPayment, 
  getPaymentHistory, 
  receiveX402Payment, 
  sendX402Payment,
  getPaymentStatus 
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { createPaymentValidator } = require('../validators/paymentValidator');
const { validate } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// POST /api/payment - Create new payment
router.post('/', authMiddleware, validate(createPaymentValidator), asyncHandler(createPayment));

// GET /api/payment/history - Get payment history
router.get('/history', authMiddleware, asyncHandler(getPaymentHistory));

// GET /api/payment/status/:transactionId - Get payment status
router.get('/status/:transactionId', authMiddleware, asyncHandler(getPaymentStatus));

// POST /api/payment/x402 - Receive x402 payment (no auth - for agent-to-agent)
router.post('/x402', asyncHandler(receiveX402Payment));

// POST /api/payment/send-x402 - Send x402 payment to another agent
router.post('/send-x402', authMiddleware, asyncHandler(sendX402Payment));

module.exports = router;