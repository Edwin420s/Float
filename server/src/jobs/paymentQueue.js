const Queue = require('bull');
const { Transaction, Treasury, User } = require('../models');
const blockchainService = require('../services/blockchainService');
const mobileMoneyService = require('../services/mobileMoneyService');
const logger = require('../utils/logger');

const paymentQueue = new Queue('payment processing', process.env.REDIS_URL);

paymentQueue.process(async (job) => {
  const { transactionId, userId, amount, currency, recipient, paymentMethod, metadata } = job.data;

  logger.info(`Processing payment ${transactionId}`);

  const transaction = await Transaction.findByPk(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  try {
    let txHash = null;
    if (paymentMethod === 'base') {
      // Get user's treasury address
      const treasury = await Treasury.findOne({ where: { userId } });
      if (!treasury || !treasury.treasuryAddress) {
        throw new Error('Treasury not deployed');
      }
      // Assume recipient is a wallet address
      const tokenAddress = '0x...'; // USDC on Base
      txHash = await blockchainService.executePayment(
        treasury.treasuryAddress,
        recipient,
        amount,
        tokenAddress
      );
    } else if (['mpesa', 'airtel', 'mtn'].includes(paymentMethod)) {
      const user = await User.findByPk(userId);
      const fromNumber = user[`${paymentMethod}Number`];
      if (!fromNumber) throw new Error(`User has no ${paymentMethod} number`);
      const result = await mobileMoneyService.sendMoney(fromNumber, recipient, amount, paymentMethod);
      txHash = result.transactionId; // use as reference
    } else {
      throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.txHash = txHash;
    await transaction.save();

    logger.info(`Payment ${transactionId} completed`);
    return { success: true, txHash };
  } catch (error) {
    logger.error(`Payment ${transactionId} failed`, error);
    transaction.status = 'failed';
    transaction.metadata = { ...transaction.metadata, error: error.message };
    await transaction.save();
    throw error;
  }
});

module.exports = paymentQueue;