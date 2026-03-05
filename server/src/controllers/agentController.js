const agentService = require('../services/agentService');
const blockchainService = require('../services/blockchainService');
const { Transaction, User, Treasury } = require('../models');
const logger = require('../utils/logger');

// GET /api/agent/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recommendations = await agentService.generateRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    logger.error('Failed to get recommendations:', error);
    next(error);
  }
};

// POST /api/agent/execute
exports.executeAgentAction = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { action, data } = req.body;

    let result;
    switch (action) {
      case 'execute_payment':
        result = await executePayment(userId, data);
        break;
      case 'allocate_funds':
        result = await allocateFunds(userId, data);
        break;
      case 'optimize_payment':
        result = await optimizePayment(userId, data);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    res.json(result);
  } catch (error) {
    logger.error('Failed to execute agent action:', error);
    next(error);
  }
};

// Execute payment based on agent recommendation
async function executePayment(userId, paymentData) {
  const { recipient, amount, currency, reason } = paymentData;
  
  // Get user's treasury
  const treasury = await Treasury.findOne({ where: { userId } });
  if (!treasury || !treasury.treasuryAddress) {
    throw new Error('Treasury not deployed');
  }

  // Execute blockchain payment
  const txHash = await blockchainService.executePayment(
    treasury.treasuryAddress,
    recipient,
    amount,
    '0x0000000000000000000000000000000000000000' // USDC address would go here
  );

  // Record transaction
  const transaction = await Transaction.create({
    userId,
    amount,
    currency: currency || 'USDC',
    recipient,
    type: 'payment',
    status: 'completed',
    paymentMethod: 'base',
    txHash,
    metadata: { reason, agentInitiated: true }
  });

  logger.info(`Agent executed payment: ${txHash}`);
  return { 
    success: true, 
    transactionId: transaction.id,
    txHash,
    amount,
    recipient
  };
}

// Allocate funds based on agent recommendation
async function allocateFunds(userId, allocationData) {
  const { reserve, operations, growth } = allocationData;
  
  // Update treasury allocation
  const treasury = await Treasury.findOne({ where: { userId } });
  if (!treasury) {
    throw new Error('Treasury not found');
  }

  treasury.reservePercentage = reserve;
  treasury.operationsPercentage = operations;
  // growth = 100 - reserve - operations (calculated)
  await treasury.save();

  logger.info(`Agent allocated funds: ${reserve}% reserve, ${operations}% operations`);
  return { 
    success: true, 
    allocation: { reserve, operations, growth }
  };
}

// Optimize payment method based on agent analysis
async function optimizePayment(userId, optimizationData) {
  const { originalPaymentMethod, optimizedPaymentMethod, savings } = optimizationData;
  
  // Create optimization record
  const transaction = await Transaction.create({
    userId,
    amount: savings || 0,
    currency: 'USDC',
    recipient: 'optimization',
    type: 'fee',
    status: 'completed',
    paymentMethod: optimizedPaymentMethod,
    metadata: { 
      type: 'optimization',
      originalPaymentMethod,
      optimizedPaymentMethod,
      savings
    }
  });

  logger.info(`Agent optimized payment: ${originalPaymentMethod} -> ${optimizedPaymentMethod}`);
  return { 
    success: true, 
    optimization: {
      originalPaymentMethod,
      optimizedPaymentMethod,
      savings
    }
  };
}