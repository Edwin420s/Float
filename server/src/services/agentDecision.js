const { Treasury, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Decision Engine - Evaluates opportunities and makes autonomous decisions
 * Performs financial safety checks and approves/rejects opportunities
 */
class AgentDecision {
  constructor() {
    this.safetyThresholds = {
      minimumLiquidityRatio: 0.3,      // 30% minimum liquidity
      maximumSingleTransaction: 0.5,    // Max 50% of total balance per transaction
      minimumReservePercentage: 20,     // 20% minimum reserve allocation
      maxDailyTransactionVolume: 0.8,   // Max 80% of daily cash flow
      confidenceThreshold: 0.7          // 70% minimum confidence for autonomous execution
    };
    
    this.decisionRules = {
      // Auto-approve rules
      autoApproveEarlyPayment: true,    // Auto-approve early payment discounts > 2%
      autoApproveHighSavings: true,     // Auto-approve opportunities with > $100 savings
      autoApproveHighROI: true,         // Auto-approve opportunities with > 15% ROI
      
      // Manual review rules
      requireManualReviewLargeAmount: 10000,  // Manual review for > $10k transactions
      requireManualReviewLowLiquidity: true,   // Manual review if liquidity < 20%
      requireManualReviewNewSupplier: true    // Manual review for new suppliers
    };
  }

  /**
   * Evaluate opportunities and make decisions
   * This is the main decision method called by the scheduler
   */
  async evaluateOpportunities(userId, opportunities, financialData) {
    try {
      logger.debug(`Evaluating ${opportunities.length} opportunities for user ${userId}`);
      
      // Get user's treasury settings for decision context
      const treasury = await Treasury.findOne({ where: { userId } });
      const user = await User.findByPk(userId);
      
      if (!treasury) {
        throw new Error('Treasury not found for user');
      }

      const decisions = [];
      const evaluationContext = {
        userId,
        treasury,
        user,
        financialData,
        safetyThresholds: this.getCustomizedThresholds(treasury),
        currentBalance: financialData.balances.total,
        liquidityRatio: financialData.metrics.liquidityRatio,
        recentTransactions: financialData.recentTransactions
      };

      // Evaluate each opportunity
      for (const opportunity of opportunities) {
        const decision = await this.evaluateOpportunity(opportunity, evaluationContext);
        decisions.push(decision);
      }

      // Sort decisions by priority and approval status
      decisions.sort((a, b) => {
        // Approved decisions first
        if (a.approved !== b.approved) {
          return a.approved ? -1 : 1;
        }
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      const approvedCount = decisions.filter(d => d.approved).length;
      const rejectedCount = decisions.filter(d => !d.approved).length;
      const manualReviewCount = decisions.filter(d => d.requiresManualReview).length;

      logger.info(`Decision evaluation completed for user ${userId}:`, {
        total: decisions.length,
        approved: approvedCount,
        rejected: rejectedCount,
        manualReview: manualReviewCount
      });

      return decisions;
    } catch (error) {
      logger.error(`Failed to evaluate opportunities for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Evaluate individual opportunity
   */
  async evaluateOpportunity(opportunity, context) {
    try {
      const decision = {
        opportunityId: opportunity.id,
        type: opportunity.type,
        title: opportunity.title,
        priority: opportunity.priority,
        potentialSavings: opportunity.potentialSavings,
        evaluatedAt: new Date().toISOString(),
        checks: {},
        approved: false,
        requiresManualReview: false,
        rejectionReasons: [],
        executionPlan: null
      };

      // 1️⃣ Liquidity Check
      const liquidityCheck = this.performLiquidityCheck(opportunity, context);
      decision.checks.liquidity = liquidityCheck;

      // 2️⃣ Risk Assessment
      const riskCheck = this.performRiskAssessment(opportunity, context);
      decision.checks.risk = riskCheck;

      // 3️⃣ Profitability Check
      const profitabilityCheck = this.performProfitabilityCheck(opportunity, context);
      decision.checks.profitability = profitabilityCheck;

      // 4️⃣ Compliance Check
      const complianceCheck = this.performComplianceCheck(opportunity, context);
      decision.checks.compliance = complianceCheck;

      // 5️⃣ Confidence Check
      const confidenceCheck = this.performConfidenceCheck(opportunity, context);
      decision.checks.confidence = confidenceCheck;

      // 6️⃣ Aggregate Decision
      const aggregateDecision = this.makeAggregateDecision(decision.checks, opportunity, context);
      decision.approved = aggregateDecision.approved;
      decision.requiresManualReview = aggregateDecision.requiresManualReview;
      decision.rejectionReasons = aggregateDecision.rejectionReasons;

      // 7️⃣ Create Execution Plan (if approved)
      if (decision.approved && !decision.requiresManualReview) {
        decision.executionPlan = this.createExecutionPlan(opportunity, context);
      }

      logger.debug(`Opportunity ${opportunity.id} evaluation:`, {
        approved: decision.approved,
        requiresManualReview: decision.requiresManualReview,
        checks: decision.checks
      });

      return decision;
    } catch (error) {
      logger.error(`Failed to evaluate opportunity ${opportunity.id}:`, error);
      return {
        opportunityId: opportunity.id,
        approved: false,
        requiresManualReview: true,
        rejectionReasons: ['Evaluation error'],
        error: error.message
      };
    }
  }

  /**
   * Perform liquidity check
   */
  performLiquidityCheck(opportunity, context) {
    const { currentBalance, liquidityRatio, safetyThresholds } = context;
    const transactionAmount = opportunity.data?.amount || 0;

    const check = {
      passed: true,
      details: {},
      warnings: []
    };

    // Check minimum liquidity ratio
    if (liquidityRatio < safetyThresholds.minimumLiquidityRatio) {
      check.passed = false;
      check.warnings.push(`Liquidity ratio ${liquidityRatio.toFixed(2)} below minimum ${safetyThresholds.minimumLiquidityRatio}`);
    }

    // Check single transaction limit
    const transactionRatio = transactionAmount / currentBalance;
    if (transactionRatio > safetyThresholds.maximumSingleTransaction) {
      check.passed = false;
      check.warnings.push(`Transaction ${(transactionRatio * 100).toFixed(1)}% of balance exceeds maximum ${(safetyThresholds.maximumSingleTransaction * 100).toFixed(1)}%`);
    }

    // Check post-transaction liquidity
    const postTransactionBalance = currentBalance - transactionAmount;
    const postTransactionLiquidity = postTransactionBalance / currentBalance;
    if (postTransactionLiquidity < 0.2) { // Keep at least 20% after transaction
      check.warnings.push(`Post-transaction liquidity would be ${(postTransactionLiquidity * 100).toFixed(1)}%`);
    }

    check.details = {
      currentBalance,
      transactionAmount,
      liquidityRatio,
      transactionRatio: transactionRatio * 100,
      postTransactionBalance,
      postTransactionLiquidity: postTransactionLiquidity * 100
    };

    return check;
  }

  /**
   * Perform risk assessment
   */
  performRiskAssessment(opportunity, context) {
    const { recentTransactions, treasury } = context;
    
    const check = {
      passed: true,
      details: {},
      warnings: []
    };

    // Check for new supplier risk
    if (opportunity.data?.supplier) {
      const supplierTransactions = recentTransactions.filter(
        tx => tx.recipient === opportunity.data.supplier
      );
      
      if (supplierTransactions.length === 0) {
        check.warnings.push('New supplier - first transaction');
        check.details.newSupplier = true;
      } else {
        check.details.supplierHistory = {
          transactionCount: supplierTransactions.length,
          totalAmount: supplierTransactions.reduce((sum, tx) => sum + tx.amount, 0),
          lastTransaction: supplierTransactions[0]?.createdAt
        };
      }
    }

    // Check transaction frequency risk
    const recentSameType = recentTransactions.filter(tx => 
      tx.type === opportunity.type || 
      (opportunity.type.includes('payment') && tx.type === 'payment')
    ).length;

    if (recentSameType > 5) {
      check.warnings.push('High frequency of similar transactions');
    }

    // Check amount risk
    const averageTransaction = recentTransactions.length > 0 ?
      recentTransactions.reduce((sum, tx) => sum + tx.amount, 0) / recentTransactions.length : 0;
    
    const transactionAmount = opportunity.data?.amount || 0;
    if (transactionAmount > averageTransaction * 3) {
      check.warnings.push('Transaction amount significantly above average');
    }

    check.details = {
      ...check.details,
      averageTransaction,
      transactionAmount,
      recentSameType,
      treasuryAllocation: treasury.allocations
    };

    return check;
  }

  /**
   * Perform profitability check
   */
  performProfitabilityCheck(opportunity, context) {
    const check = {
      passed: true,
      details: {},
      warnings: []
    };

    const potentialSavings = opportunity.potentialSavings || 0;
    const roi = opportunity.roi || 0;
    const transactionAmount = opportunity.data?.amount || 0;

    // Check minimum savings threshold
    if (potentialSavings < 10) {
      check.warnings.push('Low potential savings - may not justify execution cost');
    }

    // Check ROI threshold
    if (roi < 5) {
      check.warnings.push('Low ROI - consider alternative opportunities');
    }

    // Check savings vs transaction cost
    const estimatedTransactionCost = transactionAmount * 0.01; // 1% estimated cost
    if (potentialSavings <= estimatedTransactionCost) {
      check.passed = false;
      check.warnings.push('Potential savings less than estimated transaction cost');
    }

    check.details = {
      potentialSavings,
      roi,
      transactionAmount,
      estimatedTransactionCost,
      netSavings: potentialSavings - estimatedTransactionCost,
      savingsPercentage: transactionAmount > 0 ? (potentialSavings / transactionAmount) * 100 : 0
    };

    return check;
  }

  /**
   * Perform compliance check
   */
  performComplianceCheck(opportunity, context) {
    const { treasury, safetyThresholds } = context;
    
    const check = {
      passed: true,
      details: {},
      warnings: []
    };

    // Check reserve allocation compliance
    if (opportunity.type.includes('treasury_reallocation')) {
      const newReserve = opportunity.data?.recommendedAllocation?.reserve || treasury.reservePercentage;
      if (newReserve < safetyThresholds.minimumReservePercentage) {
        check.passed = false;
        check.warnings.push(`Reserve allocation ${newReserve}% below minimum ${safetyThresholds.minimumReservePercentage}%`);
      }
    }

    // Check transaction amount limits
    const transactionAmount = opportunity.data?.amount || 0;
    if (transactionAmount > this.decisionRules.requireManualReviewLargeAmount) {
      check.warnings.push('Large transaction requires manual review');
    }

    // Check daily transaction volume
    const todayTransactions = context.recentTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      const today = new Date();
      return txDate.toDateString() === today.toDateString();
    });
    
    const dailyVolume = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const maxDailyVolume = context.currentBalance * safetyThresholds.maxDailyTransactionVolume;
    
    if (dailyVolume + transactionAmount > maxDailyVolume) {
      check.warnings.push('Daily transaction volume limit approached');
    }

    check.details = {
      currentReserve: treasury.reservePercentage,
      transactionAmount,
      dailyVolume,
      maxDailyVolume,
      todayTransactionCount: todayTransactions.length
    };

    return check;
  }

  /**
   * Perform confidence check
   */
  performConfidenceCheck(opportunity, context) {
    const check = {
      passed: true,
      details: {},
      warnings: []
    };

    const confidence = opportunity.confidence || 0;
    const threshold = context.safetyThresholds.confidenceThreshold;

    if (confidence < threshold) {
      check.passed = false;
      check.warnings.push(`Confidence ${confidence.toFixed(2)} below threshold ${threshold}`);
    }

    check.details = {
      confidence,
      threshold,
      score: opportunity.score || 0,
      timeSensitive: opportunity.timeSensitive || false
    };

    return check;
  }

  /**
   * Make aggregate decision based on all checks
   */
  makeAggregateDecision(checks, opportunity, context) {
    const decision = {
      approved: false,
      requiresManualReview: false,
      rejectionReasons: []
    };

    // Check if any critical checks failed
    const criticalChecks = ['liquidity', 'compliance', 'confidence'];
    const failedCriticalChecks = criticalChecks.filter(check => 
      !checks[check]?.passed
    );

    if (failedCriticalChecks.length > 0) {
      decision.approved = false;
      decision.rejectionReasons.push(...failedCriticalChecks.map(check => 
        `Failed ${check} check`
      ));
      return decision;
    }

    // Check for manual review requirements
    const manualReviewTriggers = [
      opportunity.data?.amount > this.decisionRules.requireManualReviewLargeAmount,
      context.liquidityRatio < 0.2,
      checks.risk?.details?.newSupplier && this.decisionRules.requireManualReviewNewSupplier,
      checks.risk?.warnings?.length > 2
    ];

    if (manualReviewTriggers.some(trigger => trigger)) {
      decision.requiresManualReview = true;
      decision.approved = false;
      decision.rejectionReasons.push('Requires manual review');
      return decision;
    }

    // Auto-approve rules
    const autoApproveConditions = [
      opportunity.type.includes('early_payment') && opportunity.potentialSavings > 50,
      opportunity.potentialSavings > this.decisionRules.autoApproveHighSavings,
      opportunity.roi > this.decisionRules.autoApproveHighROI
    ];

    if (autoApproveConditions.some(condition => condition)) {
      decision.approved = true;
      return decision;
    }

    // Default approval for passing checks
    const allChecksPassed = Object.values(checks).every(check => check?.passed !== false);
    if (allChecksPassed && opportunity.potentialSavings > 0) {
      decision.approved = true;
    } else {
      decision.rejectionReasons.push('Insufficient justification for autonomous execution');
    }

    return decision;
  }

  /**
   * Create execution plan for approved decisions
   */
  createExecutionPlan(opportunity, context) {
    const basePlan = {
      type: opportunity.type,
      data: opportunity.data,
      estimatedTime: opportunity.estimatedExecutionTime,
      priority: opportunity.priority,
      expectedSavings: opportunity.potentialSavings
    };

    switch (opportunity.type) {
      case 'early_payment_discount':
        return {
          ...basePlan,
          action: 'execute_payment',
          steps: [
            'Validate supplier details',
            'Calculate early payment amount',
            'Execute blockchain payment',
            'Record transaction',
            'Update treasury'
          ],
          paymentMethod: 'base',
          recipient: opportunity.data.supplier,
          amount: opportunity.data.amount,
          currency: opportunity.data.currency
        };

      case 'payment_optimization':
        return {
          ...basePlan,
          action: 'optimize_payment',
          steps: [
            'Analyze current payment methods',
            'Switch to recommended method',
            'Update payment preferences',
            'Monitor transaction costs'
          ],
          currentMethod: opportunity.data.currentMethod,
          recommendedMethod: opportunity.data.recommendedMethod
        };

      case 'treasury_reallocation':
        return {
          ...basePlan,
          action: 'allocate_funds',
          steps: [
            'Validate new allocation percentages',
            'Update treasury configuration',
            'Rebalance funds if necessary',
            'Confirm allocation changes'
          ],
          currentAllocation: opportunity.data.currentAllocation,
          recommendedAllocation: opportunity.data.recommendedAllocation
        };

      case 'liquidity_improvement':
        return {
          ...basePlan,
          action: 'improve_liquidity',
          steps: [
            'Analyze liquidity constraints',
            'Identify optimization opportunities',
            'Execute liquidity improvements',
            'Monitor liquidity ratios'
          ]
        };

      default:
        return basePlan;
    }
  }

  /**
   * Get customized safety thresholds based on user preferences
   */
  getCustomizedThresholds(treasury) {
    // In a real implementation, this would consider user's risk tolerance
    return {
      ...this.safetyThresholds,
      minimumLiquidityRatio: Math.max(
        this.safetyThresholds.minimumLiquidityRatio,
        treasury.reservePercentage / 100
      )
    };
  }

  /**
   * Get decision statistics
   */
  getDecisionStats(decisions) {
    const stats = {
      total: decisions.length,
      approved: decisions.filter(d => d.approved).length,
      rejected: decisions.filter(d => !d.approved && !d.requiresManualReview).length,
      manualReview: decisions.filter(d => d.requiresManualReview).length,
      totalPotentialSavings: decisions.reduce((sum, d) => sum + (d.potentialSavings || 0), 0),
      averageConfidence: decisions.reduce((sum, d) => sum + (d.opportunity?.confidence || 0), 0) / decisions.length
    };

    return stats;
  }
}

module.exports = new AgentDecision();
