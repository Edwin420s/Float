const { User, Treasury, Transaction } = require('../models');
const blockchainService = require('./blockchainService');

// Generate an optimization recommendation for the SME
exports.generateRecommendation = async (userId) => {
  // Get user data, treasury, recent transactions
  const user = await User.findByPk(userId);
  const treasury = await Treasury.findOne({ where: { userId } });
  const recentPayments = await Transaction.findAll({
    where: { userId, type: 'payment' },
    limit: 10,
    order: [['createdAt', 'DESC']],
  });

  // Simulate analysis: check if there's an upcoming invoice with early-payment discount
  // For demo, we'll return a hardcoded recommendation
  const recommendation = {
    type: 'pay_early',
    title: 'Pay invoice early to save 9%',
    description: 'Supplier Co. invoice due in 3 days offers 3% discount if paid now. Your current liquidity is sufficient.',
    potentialSavings: 180, // USD
    action: {
      type: 'payment',
      recipient: 'Supplier Co.',
      amount: 6000,
      discount: 3,
    },
    reasoning: 'By paying now you avoid borrowing at 12% interest and capture the discount.',
  };

  // In a real agent, you'd run an optimization algorithm here
  return recommendation;
};