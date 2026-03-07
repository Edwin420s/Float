const logger = require('../utils/logger');

/**
 * Analyzer Component - Detects opportunities from financial data
 * Scans for patterns and opportunities that can improve the business's finances
 */
class AgentAnalyzer {
  constructor() {
    this.opportunityTypes = {
      EARLY_PAYMENT_DISCOUNT: 'early_payment_discount',
      PAYMENT_OPTIMIZATION: 'payment_optimization',
      TREASURY_REALLOCATION: 'treasury_reallocation',
      LIQUIDITY_IMPROVEMENT: 'liquidity_improvement',
      FEE_REDUCTION: 'fee_reduction'
    };
  }

  /**
   * Detect opportunities from collected financial data
   * This is the main analysis method called by the scheduler
   */
  async detectOpportunities(userId, financialData) {
    try {
      logger.debug(`Analyzing opportunities for user ${userId}`);
      
      const opportunities = [];

      // 1. Early Payment Discount Opportunities
      const earlyPaymentOpportunities = this.analyzeEarlyPaymentOpportunities(
        financialData.upcomingInvoices, 
        financialData.balances
      );
      opportunities.push(...earlyPaymentOpportunities);

      // 2. Payment Method Optimization
      const paymentOptimizations = this.analyzePaymentOptimizations(
        financialData.paymentHistory,
        financialData.balances
      );
      opportunities.push(...paymentOptimizations);

      // 3. Treasury Allocation Optimization
      const treasuryOptimizations = this.analyzeTreasuryAllocation(
        financialData.treasury,
        financialData.metrics
      );
      opportunities.push(...treasuryOptimizations);

      // 4. Liquidity Management Opportunities
      const liquidityOpportunities = this.analyzeLiquidityOpportunities(
        financialData.metrics,
        financialData.upcomingInvoices
      );
      opportunities.push(...liquidityOpportunities);

      // 5. Fee Reduction Opportunities
      const feeReductions = this.analyzeFeeReductions(
        financialData.recentTransactions,
        financialData.paymentHistory
      );
      opportunities.push(...feeReductions);

      // Score and prioritize opportunities
      const scoredOpportunities = this.scoreOpportunities(opportunities, financialData);
      
      // Sort by priority and potential impact
      scoredOpportunities.sort((a, b) => {
        // First by priority (high > medium > low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by potential savings (high > low)
        return (b.potentialSavings || 0) - (a.potentialSavings || 0);
      });

      logger.debug(`Detected ${scoredOpportunities.length} opportunities for user ${userId}:`, {
        earlyPayment: earlyPaymentOpportunities.length,
        paymentOptimization: paymentOptimizations.length,
        treasuryOptimization: treasuryOptimizations.length,
        liquidityOpportunities: liquidityOpportunities.length,
        feeReductions: feeReductions.length
      });

      return scoredOpportunities;
    } catch (error) {
      logger.error(`Failed to analyze opportunities for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Analyze early payment discount opportunities
   */
  analyzeEarlyPaymentOpportunities(upcomingInvoices, balances) {
    const opportunities = [];
    const baseBalance = balances.base?.USDC || 0;

    for (const invoice of upcomingInvoices) {
      const daysUntilDue = Math.ceil((invoice.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const hasDiscount = invoice.discountWindow >= daysUntilDue && invoice.discount > 0;

      if (hasDiscount && baseBalance >= invoice.amount) {
        const savings = invoice.amount * invoice.discount;
        const roi = (savings / invoice.amount) * 100; // Return on investment percentage

        opportunities.push({
          id: `early_pay_${invoice.id}`,
          type: this.opportunityTypes.EARLY_PAYMENT_DISCOUNT,
          title: `Early Payment Discount - ${invoice.supplier}`,
          description: `Pay ${invoice.supplier} early to save ${invoice.discount * 100}% ($${savings.toFixed(2)})`,
          priority: this.calculatePriority(roi, daysUntilDue, 'early_payment'),
          potentialSavings: savings,
          roi,
          timeSensitive: daysUntilDue <= invoice.discountWindow,
          data: {
            invoiceId: invoice.id,
            supplier: invoice.supplier,
            amount: invoice.amount,
            currency: invoice.currency,
            discount: invoice.discount,
            discountWindow: invoice.discountWindow,
            daysUntilDue,
            paymentMethod: 'base'
          },
          reasoning: {
            savings: `Save $${savings.toFixed(2)} with early payment`,
            urgency: daysUntilDue <= 2 ? 'Urgent - discount expires soon' : 'Time available',
            liquidity: `Sufficient balance: $${baseBalance.toFixed(2)} available`
          },
          estimatedExecutionTime: '5 minutes',
          confidence: 0.95
        });
      }
    }

    return opportunities;
  }

  /**
   * Analyze payment method optimization opportunities
   */
  analyzePaymentOptimizations(paymentHistory, balances) {
    const opportunities = [];
    const { paymentMethods } = paymentHistory;

    // Check for high-fee payment methods
    if (paymentMethods.mpesa && paymentMethods.mpesa > 3) {
      // Estimate savings from switching to Base network
      const estimatedMonthlySavings = paymentMethods.mpesa * 15; // $15 per transaction saved
      const baseBalance = balances.base?.USDC || 0;

      opportunities.push({
        id: 'optimize_mpesa_to_base',
        type: this.opportunityTypes.PAYMENT_OPTIMIZATION,
        title: 'Switch M-Pesa Payments to Base Network',
        description: `Reduce transaction fees by switching ${paymentMethods.mpesa} recent M-Pesa payments to Base network`,
        priority: baseBalance > 1000 ? 'high' : 'medium',
        potentialSavings: estimatedMonthlySavings,
        roi: 25, // 25% reduction in fees
        data: {
          currentMethod: 'mpesa',
          recommendedMethod: 'base',
          transactionCount: paymentMethods.mpesa,
          estimatedSavings: estimatedMonthlySavings
        },
        reasoning: {
          savings: `Save $${estimatedMonthlySavings.toFixed(2)} monthly on transaction fees`,
          efficiency: 'Base network offers lower fees and faster settlement',
          adoption: 'Easy migration with existing infrastructure'
        },
        estimatedExecutionTime: '15 minutes',
        confidence: 0.85
      });
    }

    return opportunities;
  }

  /**
   * Analyze treasury allocation optimization
   */
  analyzeTreasuryAllocation(treasury, metrics) {
    const opportunities = [];
    const { allocations } = treasury;

    // Check if reserve allocation is too low
    if (allocations.reserve < 30) {
      const recommendedReserve = Math.min(allocations.reserve + 20, 50);
      const riskReduction = (recommendedReserve - allocations.reserve) * 0.01; // Risk reduction factor

      opportunities.push({
        id: 'increase_reserve_allocation',
        type: this.opportunityTypes.TREASURY_REALLOCATION,
        title: 'Increase Reserve Allocation',
        description: `Move ${recommendedReserve - allocations.reserve}% to reserve for better stability`,
        priority: metrics.liquidityRatio < 0.5 ? 'high' : 'medium',
        potentialSavings: riskReduction * 1000, // Estimated risk reduction value
        roi: 15, // Risk-adjusted return
        data: {
          currentAllocation: allocations,
          recommendedAllocation: {
            ...allocations,
            reserve: recommendedReserve,
            operations: allocations.operations,
            growth: 100 - recommendedReserve - allocations.operations
          }
        },
        reasoning: {
          stability: 'Higher reserve improves financial stability',
          risk: 'Current allocation below recommended 30% minimum',
          liquidity: `Liquidity ratio: ${metrics.liquidityRatio.toFixed(2)}`
        },
        estimatedExecutionTime: '2 minutes',
        confidence: 0.90
      });
    }

    return opportunities;
  }

  /**
   * Analyze liquidity management opportunities
   */
  analyzeLiquidityOpportunities(metrics, upcomingInvoices) {
    const opportunities = [];

    // Check for liquidity warnings
    if (metrics.liquidityRatio < 0.3) {
      const urgentInvoices = upcomingInvoices.filter(inv => {
        const daysUntilDue = Math.ceil((inv.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7;
      });

      if (urgentInvoices.length > 0) {
        const totalUrgent = urgentInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        opportunities.push({
          id: 'liquidity_warning',
          type: this.opportunityTypes.LIQUIDITY_IMPROVEMENT,
          title: 'Liquidity Management Required',
          description: `Low liquidity detected - ${urgentInvoices.length} urgent payments totaling $${totalUrgent.toFixed(2)} due soon`,
          priority: 'high',
          potentialSavings: totalUrgent * 0.05, // Avoid 5% late fees
          roi: 30, // High ROI from avoiding penalties
          data: {
            liquidityRatio: metrics.liquidityRatio,
            urgentInvoices: urgentInvoices.map(inv => ({
              id: inv.id,
              supplier: inv.supplier,
              amount: inv.amount,
              daysUntilDue: Math.ceil((inv.dueDate - new Date()) / (1000 * 60 * 60 * 24))
            })),
            totalUrgentAmount: totalUrgent
          },
          reasoning: {
            urgency: 'Multiple urgent payments require attention',
            risk: 'Low liquidity ratio increases default risk',
            action: 'Consider reallocation or short-term financing'
          },
          estimatedExecutionTime: '10 minutes',
          confidence: 0.95
        });
      }
    }

    return opportunities;
  }

  /**
   * Analyze fee reduction opportunities
   */
  analyzeFeeReductions(recentTransactions, paymentHistory) {
    const opportunities = [];

    // Check for high-fee transactions
    const highFeeTransactions = recentTransactions.filter(tx => {
      // Mock fee analysis - in real implementation, would calculate actual fees
      return tx.paymentMethod === 'mpesa' && tx.amount > 1000;
    });

    if (highFeeTransactions.length > 0) {
      const totalHighFeeVolume = highFeeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const estimatedSavings = totalHighFeeVolume * 0.02; // 2% fee reduction

      opportunities.push({
        id: 'fee_reduction_optimization',
        type: this.opportunityTypes.FEE_REDUCTION,
        title: 'Optimize High-Fee Transactions',
        description: `${highFeeTransactions.length} high-fee transactions identified for optimization`,
        priority: 'medium',
        potentialSavings: estimatedSavings,
        roi: 20,
        data: {
          transactionCount: highFeeTransactions.length,
          totalVolume: totalHighFeeVolume,
          averageTransaction: totalHighFeeVolume / highFeeTransactions.length,
          recommendedMethod: 'base'
        },
        reasoning: {
          savings: `Estimated $${estimatedSavings.toFixed(2)} in fee reductions`,
          efficiency: 'Base network offers better rates for high-value transactions',
          volume: `High transaction volume justifies optimization effort`
        },
        estimatedExecutionTime: '20 minutes',
        confidence: 0.80
      });
    }

    return opportunities;
  }

  /**
   * Calculate priority based on ROI, urgency, and impact
   */
  calculatePriority(roi, urgency, type) {
    const highRoiThreshold = 10; // 10% ROI
    const urgentThreshold = 3; // 3 days

    if (roi >= highRoiThreshold && urgency <= urgentThreshold) {
      return 'high';
    } else if (roi >= 5 || urgency <= 7) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Score opportunities based on multiple factors
   */
  scoreOpportunities(opportunities, financialData) {
    return opportunities.map(opportunity => {
      let score = 0;

      // Base score from potential savings
      score += (opportunity.potentialSavings || 0) * 0.1;

      // ROI score
      score += (opportunity.roi || 0) * 2;

      // Priority score
      const priorityScores = { high: 50, medium: 25, low: 10 };
      score += priorityScores[opportunity.priority] || 0;

      // Time sensitivity bonus
      if (opportunity.timeSensitive) score += 20;

      // Confidence score
      score += (opportunity.confidence || 0.5) * 10;

      // Liquidity consideration
      if (financialData.metrics.liquidityRatio > 0.5) score += 15;

      return {
        ...opportunity,
        score: Math.round(score),
        detectedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Get opportunity statistics
   */
  getOpportunityStats(opportunities) {
    const stats = {
      total: opportunities.length,
      byType: {},
      byPriority: { high: 0, medium: 0, low: 0 },
      totalPotentialSavings: 0,
      averageConfidence: 0
    };

    opportunities.forEach(opp => {
      // Count by type
      stats.byType[opp.type] = (stats.byType[opp.type] || 0) + 1;
      
      // Count by priority
      stats.byPriority[opp.priority]++;
      
      // Sum potential savings
      stats.totalPotentialSavings += opp.potentialSavings || 0;
      
      // Average confidence
      stats.averageConfidence += opp.confidence || 0;
    });

    stats.averageConfidence = opportunities.length > 0 ? 
      stats.averageConfidence / opportunities.length : 0;

    return stats;
  }
}

module.exports = new AgentAnalyzer();
