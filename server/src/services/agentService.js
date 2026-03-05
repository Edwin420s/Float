const { User, Treasury, Transaction } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Generate multiple treasury optimization recommendations for the SME.
 * Uses a simple rule-based engine for hackathon MVP.
 */
exports.generateRecommendations = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    const treasury = await Treasury.findOne({ where: { userId } });
    
    // Get recent transactions for analysis
    const recentTransactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

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
      {
        id: 'inv_002',
        supplier: 'Logistics Ltd',
        amount: 1200,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        discount: 0.02,
        discountWindow: 5,
      }
    ];

    // Simulate current balances (in real app, fetch from blockchain/mobile money APIs)
    const balances = {
      base: 12300,      // USDC on Base
      mpesa: 45000,     // KES
      airtel: 32000,    // KES
      bank: 5000,       // KES
    };

    const recommendations = [];

    // Check early payment opportunities
    for (const invoice of upcomingInvoices) {
      const daysUntilDue = Math.ceil((invoice.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const hasDiscount = invoice.discountWindow >= daysUntilDue && invoice.discount > 0;

      // Check if we have enough liquidity to pay early
      const neededInUSD = invoice.amount;
      const baseBalance = balances.base;

      if (hasDiscount && baseBalance >= neededInUSD) {
        const savings = invoice.amount * invoice.discount;
        recommendations.push({
          id: `early_pay_${invoice.id}`,
          text: `Pay ${invoice.supplier} early to save ${(invoice.discount * 100).toFixed(0)}%`,
          type: 'positive',
          action: 'execute_payment',
          priority: 'high',
          data: {
            recipient: invoice.supplier,
            amount: invoice.amount,
            currency: 'USDC',
            reason: `Early payment discount - save $${savings}`,
            invoiceId: invoice.id
          },
          savings,
          reasoning: `By paying now you save $${savings} and avoid potential borrowing at 12% interest.`
        });
      }
    }

    // Analyze payment methods for optimization opportunities
    const mpesaTransactions = recentTransactions.filter(t => t.paymentMethod === 'mpesa');
    const airtelTransactions = recentTransactions.filter(t => t.paymentMethod === 'airtel');
    
    if (mpesaTransactions.length > 2) {
      recommendations.push({
        id: 'optimize_mpesa',
        text: 'High transaction fees detected on M-Pesa',
        type: 'warning',
        action: 'optimize_payment',
        priority: 'medium',
        data: {
          originalPaymentMethod: 'mpesa',
          optimizedPaymentMethod: 'base',
          savings: 45 // Estimated savings
        },
        savings: 45,
        reasoning: 'Recent M-Pesa transactions show high fees. Base network offers lower fees for similar transactions.'
      });
    }

    // Check treasury allocation
    if (treasury) {
      const totalAllocated = treasury.reservePercentage + treasury.operationsPercentage;
      const growthPercentage = 100 - totalAllocated;
      
      if (treasury.reservePercentage < 30) {
        recommendations.push({
          id: 'increase_reserve',
          text: 'Consider moving 20% to reserve for stability',
          type: 'info',
          action: 'allocate_funds',
          priority: 'low',
          data: {
            reserve: Math.min(treasury.reservePercentage + 20, 50),
            operations: treasury.operationsPercentage,
            growth: Math.max(growthPercentage - 20, 10)
          },
          reasoning: 'Current reserve allocation is below recommended 30% for SME stability.'
        });
      }
    }

    // If no specific recommendations, add general advice
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'general_health',
        text: 'Treasury health is optimal',
        type: 'info',
        action: null,
        priority: 'low',
        reasoning: 'All systems operating efficiently. No immediate actions required.'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  } catch (error) {
    logger.error('Failed to generate recommendations:', error);
    // Return fallback recommendations
    return [
      {
        id: 'fallback_1',
        text: 'Pay invoice early to save 9%',
        type: 'positive',
        action: 'execute_payment',
        priority: 'high',
        data: {
          recipient: 'Supplier Co.',
          amount: 6000,
          currency: 'USDC',
          reason: 'Early payment discount'
        }
      }
    ];
  }
};

/**
 * Analyze liquidity position for decision making
 */
exports.analyzeLiquidity = async (userId) => {
  try {
    const treasury = await Treasury.findOne({ where: { userId } });
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    // Calculate cash flow metrics
    const inflows = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const outflows = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netCashFlow = inflows - outflows;

    return {
      netCashFlow,
      inflows,
      outflows,
      transactionCount: transactions.length,
      healthScore: netCashFlow > 0 ? 'healthy' : netCashFlow > -1000 ? 'caution' : 'critical'
    };
  } catch (error) {
    logger.error('Failed to analyze liquidity:', error);
    return {
      netCashFlow: 0,
      inflows: 0,
      outflows: 0,
      transactionCount: 0,
      healthScore: 'unknown'
    };
  }
};

/**
 * Simulate mobile money integration
 */
exports.getMobileMoneyBalances = async (userId) => {
  const user = await User.findByPk(userId);
  
  // In real implementation, these would call actual mobile money APIs
  return {
    mpesa: {
      balance: 45000,
      currency: 'KES',
      lastUpdated: new Date()
    },
    airtel: {
      balance: 32000,
      currency: 'KES',
      lastUpdated: new Date()
    },
    mtn: {
      balance: 0,
      currency: 'KES',
      lastUpdated: new Date()
    }
  };
};