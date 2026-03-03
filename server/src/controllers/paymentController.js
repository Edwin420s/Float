const { Transaction, User } = require('../models');
const blockchainService = require('../services/blockchainService');
const mobileMoneyService = require('../services/mobileMoneyService');
const paymentQueue = require('../jobs/paymentQueue');

// POST /api/payment
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, recipient, paymentMethod, metadata } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create transaction record (pending)
    const transaction = await Transaction.create({
      userId,
      amount,
      currency,
      recipient,
      type: 'payment',
      status: 'pending',
      paymentMethod,
      metadata,
    });

    // Add to queue for async processing
    await paymentQueue.add({
      transactionId: transaction.id,
      userId,
      amount,
      currency,
      recipient,
      paymentMethod,
      metadata,
    });

    res.json({ transactionId: transaction.id, status: 'pending' });
  } catch (error) {
    next(error);
  }
};

// GET /api/payment/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// POST /api/payment/x402 (simulate x402 incoming payment)
exports.receiveX402Payment = async (req, res, next) => {
  // This endpoint would be called by another agent with x402 headers
  // For demo, we just log and return success
  const { amount, fromAgent, invoiceId } = req.body;
  const paymentHeader = req.headers['x-payment']; // mock x402 header

  logger.info(`x402 payment received: ${amount} from ${fromAgent}, header: ${paymentHeader}`);

  // Create transaction record
  await Transaction.create({
    userId: null, // could be system
    amount,
    currency: 'USDC',
    recipient: 'treasury',
    type: 'deposit',
    status: 'completed',
    paymentMethod: 'x402',
    metadata: { fromAgent, invoiceId },
  });

  res.json({ received: true });
};