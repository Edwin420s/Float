const { User, Treasury, Transaction } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a treasury optimization recommendation for the SME.
 * Uses a simple rule-based engine for hackathon MVP.
 */
exports.generateRecommendation = async (userId) => {
  const user = await User.findByPk(userId);
  const treasury = await Treasury.findOne({ where: { userId } });

  // Mock upcoming invoices – in real app you'd fetch from an accounting system
  const upcomingInvoices = [
    {
      id: 'inv_001',
      supplier: 'Supplier Co.',
      amount: 6000,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      discount: 0.03, // 3% early payment discount
      discountWindow: 2, // days left to get discount
    },
  ];

  // Simulate current balances
  const balances = {
    base: 12300,      // USDC on Base
    mpesa: 45000,     // KES
    airtel: 32000,    // KES
    bank: 5000,       // KES
  };

  // Evaluate each invoice
  for (const invoice of upcomingInvoices) {
    const daysUntilDue = Math.ceil((invoice.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    const hasDiscount = invoice.discountWindow >= daysUntilDue && invoice.discount > 0;

    // Check if we have enough liquidity to pay early
    const neededInUSD = invoice.amount; // assume invoice is USD
    const baseBalance = balances.base;

    if (hasDiscount && baseBalance >= neededInUSD) {
      // Calculate savings
      const savings = invoice.amount * invoice.discount;
      return {
        type: 'pay_early',
        title: `Pay ${invoice.supplier} early to save ${(invoice.discount * 100).toFixed(0)}%`,
        description: `Invoice #${invoice.id} due in ${daysUntilDue} days offers ${invoice.discount * 100}% discount if paid now. Your Base wallet has sufficient funds.`,
        potentialSavings: savings,
        action: {
          type: 'payment',
          recipient: invoice.supplier,
          amount: invoice.amount,
          discount: invoice.discount * 100,
          invoiceId: invoice.id,
        },
        reasoning: `By paying now you save $${savings} and avoid potential borrowing at 12% interest.`,
      };
    }
  }

  // If no early payment opportunity, check if borrowing is needed
  // ... (simplified)
  return {
    type: 'info',
    title: 'All invoices on track',
    description: 'No immediate action needed. Your liquidity is healthy.',
    potentialSavings: 0,
    action: null,
    reasoning: 'All upcoming obligations are covered.',
  };
};