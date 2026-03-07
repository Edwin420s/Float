const { Transaction, Treasury } = require('../models');
const blockchainService = require('./blockchainService');
const mobileMoneyService = require('./mobileMoneyService');
const logger = require('../utils/logger');

/**
 * Executor Component - Performs autonomous execution of approved decisions
 * Executes blockchain transactions and updates system state
 */
class AgentExecutor {
  constructor() {
    this.executionQueue = [];
    this.activeExecutions = new Map();
    this.executionStats = {
      total: 0,
      successful: 0,
      failed: 0,
      totalSavings: 0
    };
  }

  /**
   * Execute approved decisions autonomously
   * This is the main execution method called by the scheduler
   */
  async executeDecisions(userId, decisions) {
    try {
      logger.debug(`Executing ${decisions.length} decisions for user ${userId}`);
      
      const executions = [];
      const approvedDecisions = decisions.filter(d => d.approved && !d.requiresManualReview);

      if (approvedDecisions.length === 0) {
        logger.debug(`No approved decisions to execute for user ${userId}`);
        return executions;
      }

      // Execute decisions concurrently with limits
      const executionPromises = approvedDecisions.map(decision => 
        this.executeDecision(userId, decision)
      );

      const results = await Promise.allSettled(executionPromises);
      
      // Process results
      results.forEach((result, index) => {
        const decision = approvedDecisions[index];
        if (result.status === 'fulfilled') {
          executions.push(result.value);
          logger.info(`Successfully executed decision ${decision.opportunityId} for user ${userId}`);
        } else {
          logger.error(`Failed to execute decision ${decision.opportunityId} for user ${userId}:`, result.reason);
          executions.push({
            decisionId: decision.opportunityId,
            success: false,
            error: result.reason.message,
            executedAt: new Date().toISOString()
          });
        }
      });

      // Update execution statistics
      this.updateExecutionStats(executions);

      const successfulExecutions = executions.filter(e => e.success);
      logger.info(`Execution completed for user ${userId}:`, {
        total: executions.length,
        successful: successfulExecutions.length,
        failed: executions.length - successfulExecutions.length,
        totalSavings: successfulExecutions.reduce((sum, e) => sum + (e.savings || 0), 0)
      });

      return executions;
    } catch (error) {
      logger.error(`Failed to execute decisions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Execute individual decision
   */
  async executeDecision(userId, decision) {
    const executionId = `${userId}_${decision.opportunityId}_${Date.now()}`;
    
    // Prevent duplicate executions
    if (this.activeExecutions.has(executionId)) {
      throw new Error(`Execution ${executionId} already in progress`);
    }

    const executionPromise = this.performExecution(userId, decision, executionId);
    this.activeExecutions.set(executionId, executionPromise);

    try {
      const result = await executionPromise;
      return result;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Perform the actual execution
   */
  async performExecution(userId, decision, executionId) {
    const execution = {
      executionId,
      decisionId: decision.opportunityId,
      userId,
      type: decision.type,
      title: decision.title,
      startedAt: new Date().toISOString(),
      success: false,
      savings: 0,
      transactionId: null,
      error: null
    };

    try {
      logger.info(`Starting execution ${executionId}: ${decision.title}`);

      // Execute based on decision type
      let executionResult;
      switch (decision.executionPlan?.action) {
        case 'execute_payment':
          executionResult = await this.executePayment(userId, decision);
          break;
        case 'optimize_payment':
          executionResult = await this.optimizePayment(userId, decision);
          break;
        case 'allocate_funds':
          executionResult = await this.allocateFunds(userId, decision);
          break;
        case 'improve_liquidity':
          executionResult = await this.improveLiquidity(userId, decision);
          break;
        default:
          throw new Error(`Unknown execution action: ${decision.executionPlan?.action}`);
      }

      // Update execution with results
      execution.success = executionResult.success;
      execution.savings = executionResult.savings || decision.potentialSavings || 0;
      execution.transactionId = executionResult.transactionId;
      execution.completedAt = new Date().toISOString();
      execution.details = executionResult.details;

      // Record transaction if successful
      if (executionResult.success && executionResult.transaction) {
        await this.recordExecutionTransaction(userId, execution, executionResult.transaction);
      }

      logger.info(`Execution ${executionId} completed successfully`, {
        success: execution.success,
        savings: execution.savings,
        transactionId: execution.transactionId
      });

      return execution;
    } catch (error) {
      logger.error(`Execution ${executionId} failed:`, error);
      execution.success = false;
      execution.error = error.message;
      execution.completedAt = new Date().toISOString();
      return execution;
    }
  }

  /**
   * Execute payment decision
   */
  async executePayment(userId, decision) {
    try {
      const { data } = decision.executionPlan;
      const treasury = await Treasury.findOne({ where: { userId } });

      if (!treasury || !treasury.treasuryAddress) {
        throw new Error('Treasury not deployed');
      }

      // Execute blockchain payment
      const txHash = await blockchainService.executePayment(
        treasury.treasuryAddress,
        data.recipient,
        data.amount,
        '0x036CbD53842c5426634e7929541eC2318f3dcF7e' // USDC address on Base
      );

      // Calculate actual savings
      const savings = decision.potentialSavings || 0;

      return {
        success: true,
        transactionId: txHash,
        savings,
        details: {
          recipient: data.recipient,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: 'base',
          type: 'early_payment_discount'
        },
        transaction: {
          userId,
          amount: data.amount,
          currency: data.currency,
          recipient: data.recipient,
          type: 'payment',
          status: 'completed',
          paymentMethod: 'base',
          txHash,
          metadata: {
            agentInitiated: true,
            decisionId: decision.opportunityId,
            savings,
            reason: `Early payment discount - save $${savings.toFixed(2)}`
          }
        }
      };
    } catch (error) {
      logger.error(`Payment execution failed:`, error);
      throw error;
    }
  }

  /**
   * Execute payment optimization decision
   */
  async optimizePayment(userId, decision) {
    try {
      const { currentMethod, recommendedMethod } = decision.executionPlan.data;
      
      // Create optimization record
      const transaction = await Transaction.create({
        userId,
        amount: decision.potentialSavings || 0,
        currency: 'USDC',
        recipient: 'optimization',
        type: 'fee',
        status: 'completed',
        paymentMethod: recommendedMethod,
        metadata: {
          agentInitiated: true,
          decisionId: decision.opportunityId,
          type: 'payment_optimization',
          originalPaymentMethod: currentMethod,
          optimizedPaymentMethod: recommendedMethod,
          savings: decision.potentialSavings
        }
      });

      return {
        success: true,
        transactionId: `optim_${transaction.id}`,
        savings: decision.potentialSavings,
        details: {
          optimizationType: 'payment_method',
          from: currentMethod,
          to: recommendedMethod,
          estimatedSavings: decision.potentialSavings
        },
        transaction: null // Already created above
      };
    } catch (error) {
      logger.error(`Payment optimization failed:`, error);
      throw error;
    }
  }

  /**
   * Execute treasury allocation decision
   */
  async allocateFunds(userId, decision) {
    try {
      const { recommendedAllocation } = decision.executionPlan.data;
      
      // Update treasury allocation
      const treasury = await Treasury.findOne({ where: { userId } });
      if (!treasury) {
        throw new Error('Treasury not found');
      }

      treasury.reservePercentage = recommendedAllocation.reserve;
      treasury.operationsPercentage = recommendedAllocation.operations;
      await treasury.save();

      // Record allocation change
      const transaction = await Transaction.create({
        userId,
        amount: 0,
        currency: 'USDC',
        recipient: 'treasury',
        type: 'allocation',
        status: 'completed',
        paymentMethod: 'system',
        metadata: {
          agentInitiated: true,
          decisionId: decision.opportunityId,
          type: 'treasury_reallocation',
          previousAllocation: {
            reserve: treasury.reservePercentage,
            operations: treasury.operationsPercentage
          },
          newAllocation: recommendedAllocation
        }
      });

      return {
        success: true,
        transactionId: `alloc_${transaction.id}`,
        savings: 0, // Allocation changes don't generate direct savings
        details: {
          allocationChange: true,
          previousAllocation: {
            reserve: treasury.reservePercentage,
            operations: treasury.operationsPercentage
          },
          newAllocation: recommendedAllocation
        },
        transaction: null // Already created above
      };
    } catch (error) {
      logger.error(`Treasury allocation failed:`, error);
      throw error;
    }
  }

  /**
   * Execute liquidity improvement decision
   */
  async improveLiquidity(userId, decision) {
    try {
      // For liquidity improvements, we typically create recommendations
      // rather than direct transactions
      
      const transaction = await Transaction.create({
        userId,
        amount: decision.potentialSavings || 0,
        currency: 'USDC',
        recipient: 'liquidity',
        type: 'optimization',
        status: 'completed',
        paymentMethod: 'system',
        metadata: {
          agentInitiated: true,
          decisionId: decision.opportunityId,
          type: 'liquidity_improvement',
          urgentInvoices: decision.executionPlan.data.urgentInvoices,
          totalUrgentAmount: decision.executionPlan.data.totalUrgentAmount,
          recommendations: [
            'Consider short-term financing options',
            'Prioritize high-value urgent payments',
            'Review upcoming payment schedule'
          ]
        }
      });

      return {
        success: true,
        transactionId: `liq_${transaction.id}`,
        savings: decision.potentialSavings,
        details: {
          improvementType: 'liquidity_management',
          urgentInvoices: decision.executionPlan.data.urgentInvoices.length,
          totalUrgentAmount: decision.executionPlan.data.totalUrgentAmount,
          recommendations: [
            'Monitor cash flow closely',
            'Consider payment prioritization',
            'Evaluate financing options'
          ]
        },
        transaction: null // Already created above
      };
    } catch (error) {
      logger.error(`Liquidity improvement failed:`, error);
      throw error;
    }
  }

  /**
   * Record execution transaction in database
   */
  async recordExecutionTransaction(userId, execution, transactionData) {
    try {
      if (transactionData) {
        await Transaction.create(transactionData);
        logger.debug(`Transaction recorded for execution ${execution.executionId}`);
      }
    } catch (error) {
      logger.error(`Failed to record transaction for execution ${execution.executionId}:`, error);
      // Don't throw here - execution was successful, just recording failed
    }
  }

  /**
   * Update execution statistics
   */
  updateExecutionStats(executions) {
    executions.forEach(execution => {
      this.executionStats.total++;
      if (execution.success) {
        this.executionStats.successful++;
        this.executionStats.totalSavings += execution.savings || 0;
      } else {
        this.executionStats.failed++;
      }
    });
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId) {
    return this.activeExecutions.get(executionId) || null;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats() {
    return {
      ...this.executionStats,
      activeExecutions: this.activeExecutions.size,
      queueLength: this.executionQueue.length,
      successRate: this.executionStats.total > 0 ? 
        (this.executionStats.successful / this.executionStats.total) * 100 : 0
    };
  }

  /**
   * Get recent executions for user
   */
  async getRecentExecutions(userId, limit = 10) {
    try {
      const transactions = await Transaction.findAll({
        where: { 
          userId,
          'metadata.agentInitiated': true 
        },
        order: [['createdAt', 'DESC']],
        limit
      });

      return transactions.map(tx => ({
        transactionId: tx.id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        paymentMethod: tx.paymentMethod,
        savings: tx.metadata?.savings || 0,
        decisionId: tx.metadata?.decisionId,
        executedAt: tx.createdAt,
        details: tx.metadata
      }));
    } catch (error) {
      logger.error(`Failed to get recent executions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Cancel execution (if still running)
   */
  async cancelExecution(executionId) {
    if (this.activeExecutions.has(executionId)) {
      // Note: In a real implementation, you'd need to handle actual cancellation
      // of blockchain transactions, which is complex
      this.activeExecutions.delete(executionId);
      logger.info(`Execution ${executionId} cancelled`);
      return true;
    }
    return false;
  }

  /**
   * Reset execution statistics
   */
  resetStats() {
    this.executionStats = {
      total: 0,
      successful: 0,
      failed: 0,
      totalSavings: 0
    };
  }
}

module.exports = new AgentExecutor();
