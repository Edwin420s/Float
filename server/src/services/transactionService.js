const { Transaction } = require('../models');

/**
 * Create a new transaction record
 */
exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

/**
 * Update transaction status
 */
exports.updateTransactionStatus = async (transactionId, status, txHash = null, metadata = {}) => {
  const transaction = await Transaction.findByPk(transactionId);
  if (!transaction) throw new Error('Transaction not found');
  transaction.status = status;
  if (txHash) transaction.txHash = txHash;
  if (metadata) transaction.metadata = { ...transaction.metadata, ...metadata };
  await transaction.save();
  return transaction;
};

/**
 * Get user transactions
 */
exports.getUserTransactions = async (userId, limit = 50) => {
  return await Transaction.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit,
  });
};