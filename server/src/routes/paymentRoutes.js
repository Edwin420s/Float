const express = require('express');
const {
  createPayment,
  getPaymentHistory,
  receiveX402Payment,
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createPayment);
router.get('/history', authMiddleware, getPaymentHistory);
router.post('/x402', receiveX402Payment); // no auth for demo (agent calls)

module.exports = router;