const { Transaction, User } = require('../models');
const blockchainService = require('../services/blockchainService');
const mobileMoneyService = require('../services/mobileMoneyService');
const paymentQueue = require('../jobs/paymentQueue');
const logger = require('../utils/logger');

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
      currency: currency || 'USDC',
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

    logger.info(`Payment queued: ${transaction.id} for ${amount} ${currency} to ${recipient}`);
    res.json({ transactionId: transaction.id, status: 'pending' });
  } catch (error) {
    logger.error('Payment creation failed:', error);
    next(error);
  }
};

// GET /api/payment/history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(transactions);
  } catch (error) {
    logger.error('Failed to get payment history:', error);
    next(error);
  }
};

// POST /api/payment/x402 (receive x402 incoming payment)
exports.receiveX402Payment = async (req, res, next) => {
  try {
    // This endpoint would be called by another agent with x402 headers
    const { amount, fromAgent, invoiceId, serviceType } = req.body;
    const paymentHeader = req.headers['x-payment']; // x402 header
    const paymentDigest = req.headers['x-payment-digest']; // x402 digest

    logger.info(`x402 payment received: ${amount} from ${fromAgent}, header: ${paymentHeader}`);

    // Validate x402 payment (simplified validation)
    if (!paymentHeader || !paymentHeader.startsWith('x402')) {
      return res.status(400).json({ error: 'Invalid x402 payment header' });
    }

    // Parse payment header: "x402 100 USDC invoice_123"
    const headerParts = paymentHeader.split(' ');
    if (headerParts.length < 4) {
      return res.status(400).json({ error: 'Malformed x402 payment header' });
    }

    const headerAmount = parseFloat(headerParts[1]);
    const headerCurrency = headerParts[2];
    const headerInvoiceId = headerParts[3];

    // Verify amounts match
    if (Math.abs(headerAmount - amount) > 0.01) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Create transaction record for x402 payment
    const transaction = await Transaction.create({
      userId: null, // system transaction for demo
      amount,
      currency: headerCurrency,
      recipient: 'treasury',
      type: 'deposit',
      status: 'completed',
      paymentMethod: 'x402',
      txHash: `x402_${Date.now()}`,
      metadata: { 
        fromAgent, 
        invoiceId: headerInvoiceId,
        serviceType,
        paymentHeader,
        paymentDigest,
        x402Version: '1.0'
      }
    });

    logger.info(`x402 payment processed: ${transaction.id}`);
    
    // Return x402 receipt
    res.json({ 
      received: true,
      transactionId: transaction.id,
      amount,
      currency: headerCurrency,
      processedAt: new Date().toISOString(),
      receipt: {
        paymentHeader,
        paymentDigest,
        transactionHash: transaction.txHash
      }
    });
  } catch (error) {
    logger.error('x402 payment processing failed:', error);
    next(error);
  }
};

// POST /api/payment/send-x402 (send x402 payment to another agent)
exports.sendX402Payment = async (req, res, next) => {
  try {
    const { targetUrl, amount, invoiceId, serviceType } = req.body;
    const userId = req.user.userId;

    if (!targetUrl || !amount) {
      return res.status(400).json({ error: 'Target URL and amount required' });
    }

    // Send x402 payment via blockchain service
    const result = await blockchainService.sendX402Payment(targetUrl, amount, invoiceId);

    // Record outgoing x402 payment
    const transaction = await Transaction.create({
      userId,
      amount: -amount, // negative for outgoing
      currency: 'USDC',
      recipient: targetUrl,
      type: 'payment',
      status: 'completed',
      paymentMethod: 'x402',
      txHash: result.txHash || `x402_out_${Date.now()}`,
      metadata: {
        serviceType,
        invoiceId,
        targetUrl,
        x402Version: '1.0',
        direction: 'outgoing'
      }
    });

    logger.info(`x402 payment sent: ${transaction.id} to ${targetUrl}`);
    
    res.json({
      success: true,
      transactionId: transaction.id,
      amount,
      targetUrl,
      result
    });
  } catch (error) {
    logger.error('Failed to send x402 payment:', error);
    next(error);
  }
};

// GET /api/payment/status/:transactionId
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If it's a blockchain transaction, get details
    let blockchainDetails = null;
    if (transaction.txHash && transaction.paymentMethod === 'base') {
      blockchainDetails = await blockchainService.getTransaction(transaction.txHash);
    }

    res.json({
      transaction,
      blockchainDetails,
      estimatedCompletion: transaction.status === 'pending' ? 
        new Date(Date.now() + 5 * 60 * 1000) : null // 5 minutes from now
    });
  } catch (error) {
    logger.error('Failed to get payment status:', error);
    next(error);
  }
};