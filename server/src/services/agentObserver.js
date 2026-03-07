const { Transaction, Treasury } = require('../models');
const blockchainService = require('./blockchainService');
const mobileMoneyService = require('./mobileMoneyService');
const logger = require('../utils/logger');

/**
 * Observer Component - Collects financial data for the autonomous agent
 * Continuously monitors the SME's financial environment
 */
class AgentObserver {
  constructor() {
    this.observationCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Collect comprehensive financial data for a user
   * This is the main observation method called by the scheduler
   */
  async collectFinancialData(userId) {
    try {
      logger.debug(`Collecting financial data for user ${userId}`);

      // Check cache first
      const cacheKey = `financial_data_${userId}`;
      const cached = this.observationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        logger.debug(`Using cached financial data for user ${userId}`);
        return cached.data;
      }

      // Collect data from multiple sources
      const [
        treasuryData,
        recentTransactions,
        blockchainBalances,
        mobileMoneyBalances,
        upcomingInvoices,
        paymentHistory
      ] = await Promise.all([
        this.getTreasuryData(userId),
        this.getRecentTransactions(userId),
        this.getBlockchainBalances(userId),
        this.getMobileMoneyBalances(userId),
        this.getUpcomingInvoices(userId),
        this.getPaymentHistory(userId)
      ]);

      // Calculate financial metrics
      const totalBalance = this.calculateTotalBalance(blockchainBalances, mobileMoneyBalances);
      const liquidityRatio = this.calculateLiquidityRatio(totalBalance, upcomingInvoices);
      const cashFlowMetrics = this.calculateCashFlowMetrics(recentTransactions);

      const financialData = {
        userId,
        timestamp: new Date().toISOString(),
        
        // Balance information
        treasury: treasuryData,
        balances: {
          ...blockchainBalances,
          ...mobileMoneyBalances,
          total: totalBalance
        },
        
        // Transaction data
        recentTransactions,
        paymentHistory,
        
        // Upcoming obligations
        upcomingInvoices,
        
        // Calculated metrics
        metrics: {
          totalBalance,
          liquidityRatio,
          ...cashFlowMetrics
        },
        
        // System health
        systemHealth: {
          lastUpdated: new Date().toISOString(),
          dataSources: {
            blockchain: !!blockchainBalances,
            mobileMoney: !!mobileMoneyBalances,
            database: !!recentTransactions
          }
        }
      };

      // Cache the results
      this.observationCache.set(cacheKey, {
        data: financialData,
        timestamp: Date.now()
      });

      logger.debug(`Financial data collected for user ${userId}:`, {
        totalBalance,
        transactionCount: recentTransactions.length,
        invoiceCount: upcomingInvoices.length,
        liquidityRatio
      });

      return financialData;
    } catch (error) {
      logger.error(`Failed to collect financial data for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get treasury configuration and status
   */
  async getTreasuryData(userId) {
    try {
      const treasury = await Treasury.findOne({ where: { userId } });
      
      if (!treasury) {
        throw new Error('Treasury not found for user');
      }

      return {
        address: treasury.treasuryAddress,
        allocations: {
          reserve: treasury.reservePercentage,
          operations: treasury.operationsPercentage,
          growth: 100 - treasury.reservePercentage - treasury.operationsPercentage
        },
        isActive: treasury.isActive,
        createdAt: treasury.createdAt
      };
    } catch (error) {
      logger.error(`Failed to get treasury data for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent transactions from database
   */
  async getRecentTransactions(userId, limit = 50) {
    try {
      const transactions = await Transaction.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit
      });

      return transactions.map(tx => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        currency: tx.currency,
        recipient: tx.recipient,
        type: tx.type,
        status: tx.status,
        paymentMethod: tx.paymentMethod,
        createdAt: tx.createdAt,
        metadata: tx.metadata
      }));
    } catch (error) {
      logger.error(`Failed to get recent transactions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get blockchain balances from Base network
   */
  async getBlockchainBalances(userId) {
    try {
      const treasury = await Treasury.findOne({ where: { userId } });
      
      if (!treasury || !treasury.treasuryAddress) {
        return { base: { USDC: 0, ETH: 0 } };
      }

      // Get USDC balance (mock implementation)
      const usdcBalance = await blockchainService.getTokenBalance(
        treasury.treasuryAddress,
        '0x036CbD53842c5426634e7929541eC2318f3dcF7e' // USDC on Base
      );

      // Get native ETH balance
      const ethBalance = await blockchainService.getNativeBalance(treasury.treasuryAddress);

      return {
        base: {
          USDC: parseFloat(usdcBalance) || 0,
          ETH: parseFloat(ethBalance) || 0
        }
      };
    } catch (error) {
      logger.error(`Failed to get blockchain balances for user ${userId}:`, error);
      return { base: { USDC: 0, ETH: 0 } };
    }
  }

  /**
   * Get mobile money balances
   */
  async getMobileMoneyBalances(userId) {
    try {
      // In real implementation, these would call actual mobile money APIs
      const balances = await mobileMoneyService.getAllBalances(userId);
      
      return {
        mpesa: { balance: balances.mpesa?.balance || 0, currency: 'KES' },
        airtel: { balance: balances.airtel?.balance || 0, currency: 'KES' },
        mtn: { balance: balances.mtn?.balance || 0, currency: 'KES' }
      };
    } catch (error) {
      logger.error(`Failed to get mobile money balances for user ${userId}:`, error);
      return { mpesa: { balance: 0, currency: 'KES' }, airtel: { balance: 0, currency: 'KES' }, mtn: { balance: 0, currency: 'KES' } };
    }
  }

  /**
   * Get upcoming invoices (mock data for demo)
   * In real implementation, this would integrate with accounting systems
   */
  async getUpcomingInvoices(userId) {
    try {
      // Mock upcoming invoices - in real app, fetch from accounting API
      const mockInvoices = [
        {
          id: 'inv_001',
          supplier: 'Supplier Co.',
          amount: 6000,
          currency: 'USDC',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          discount: 0.03, // 3% early payment discount
          discountWindow: 2, // days left to get discount
          category: 'inventory',
          priority: 'high'
        },
        {
          id: 'inv_002',
          supplier: 'Logistics Ltd',
          amount: 1200,
          currency: 'USDC',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          discount: 0.02,
          discountWindow: 5,
          category: 'shipping',
          priority: 'medium'
        },
        {
          id: 'inv_003',
          supplier: 'Utility Provider',
          amount: 800,
          currency: 'USDC',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          discount: 0,
          discountWindow: 0,
          category: 'utilities',
          priority: 'low'
        }
      ];

      return mockInvoices;
    } catch (error) {
      logger.error(`Failed to get upcoming invoices for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get payment history analysis
   */
  async getPaymentHistory(userId) {
    try {
      const transactions = await Transaction.findAll({
        where: { 
          userId, 
          type: 'payment',
          status: 'completed'
        },
        order: [['createdAt', 'DESC']],
        limit: 100
      });

      // Analyze payment patterns
      const paymentMethods = {};
      const monthlySpending = {};
      
      transactions.forEach(tx => {
        // Count by payment method
        paymentMethods[tx.paymentMethod] = (paymentMethods[tx.paymentMethod] || 0) + 1;
        
        // Group by month
        const month = tx.createdAt.toISOString().substring(0, 7); // YYYY-MM
        monthlySpending[month] = (monthlySpending[month] || 0) + parseFloat(tx.amount);
      });

      return {
        totalPayments: transactions.length,
        averagePaymentAmount: transactions.length > 0 
          ? transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length 
          : 0,
        paymentMethods,
        monthlySpending,
        lastPayment: transactions[0]?.createdAt || null
      };
    } catch (error) {
      logger.error(`Failed to get payment history for user ${userId}:`, error);
      return {
        totalPayments: 0,
        averagePaymentAmount: 0,
        paymentMethods: {},
        monthlySpending: {},
        lastPayment: null
      };
    }
  }

  /**
   * Calculate total balance across all sources
   */
  calculateTotalBalance(blockchainBalances, mobileMoneyBalances) {
    let total = 0;
    
    // Add blockchain balances (convert to USD equivalent)
    if (blockchainBalances.base) {
      total += blockchainBalances.base.USDC || 0;
      total += (blockchainBalances.base.ETH || 0) * 2000; // Mock ETH price
    }
    
    // Add mobile money balances (convert KES to USD at mock rate)
    const kesToUsdRate = 0.0075; // Mock conversion rate
    total += (mobileMoneyBalances.mpesa?.balance || 0) * kesToUsdRate;
    total += (mobileMoneyBalances.airtel?.balance || 0) * kesToUsdRate;
    total += (mobileMoneyBalances.mtn?.balance || 0) * kesToUsdRate;
    
    return total;
  }

  /**
   * Calculate liquidity ratio (available cash vs upcoming obligations)
   */
  calculateLiquidityRatio(totalBalance, upcomingInvoices) {
    const upcomingObligations = upcomingInvoices
      .filter(inv => inv.dueDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // Next 30 days
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    return upcomingObligations > 0 ? totalBalance / upcomingObligations : 1;
  }

  /**
   * Calculate cash flow metrics
   */
  calculateCashFlowMetrics(recentTransactions) {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTx = recentTransactions.filter(tx => new Date(tx.createdAt) >= last30Days);
    
    const inflows = recentTx
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const outflows = recentTx
      .filter(tx => tx.type === 'payment')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      inflows,
      outflows,
      netCashFlow: inflows - outflows,
      transactionCount: recentTx.length,
      averageTransactionValue: recentTx.length > 0 ? (inflows + outflows) / recentTx.length : 0
    };
  }

  /**
   * Clear observation cache
   */
  clearCache(userId = null) {
    if (userId) {
      this.observationCache.delete(`financial_data_${userId}`);
    } else {
      this.observationCache.clear();
    }
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    return {
      size: this.observationCache.size,
      entries: Array.from(this.observationCache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }
}

module.exports = new AgentObserver();
