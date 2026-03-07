const agentScheduler = require('../services/agentScheduler');
const agentObserver = require('../services/agentObserver');
const agentAnalyzer = require('../services/agentAnalyzer');
const agentDecision = require('../services/agentDecision');
const agentExecutor = require('../services/agentExecutor');
const logger = require('../utils/logger');

// GET /api/agent/status - Get autonomous agent status
exports.getAgentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get scheduler status
    const schedulerStatus = agentScheduler.getStatus();
    
    // Get observer cache status
    const observerStatus = agentObserver.getCacheStatus();
    
    // Get executor statistics
    const executorStats = agentExecutor.getExecutionStats();
    
    // Get recent executions for this user
    const recentExecutions = await agentExecutor.getRecentExecutions(userId, 5);
    
    // Get current financial data
    const financialData = await agentObserver.collectFinancialData(userId);
    
    res.json({
      scheduler: schedulerStatus,
      observer: observerStatus,
      executor: executorStats,
      recentExecutions,
      currentFinancialState: {
        totalBalance: financialData.balances.total,
        liquidityRatio: financialData.metrics.liquidityRatio,
        lastUpdated: financialData.timestamp
      },
      autonomousMode: {
        enabled: schedulerStatus.isRunning,
        lastCycle: new Date().toISOString(),
        nextCycle: '5 minutes'
      }
    });
  } catch (error) {
    logger.error('Failed to get agent status:', error);
    next(error);
  }
};

// POST /api/agent/force-cycle - Force run agent cycle for user
exports.forceAgentCycle = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    logger.info(`Force running agent cycle for user ${userId}`);
    
    const cycleResult = await agentScheduler.runUserCycle(userId);
    
    res.json({
      success: true,
      message: 'Agent cycle completed',
      result: cycleResult
    });
  } catch (error) {
    logger.error('Failed to force agent cycle:', error);
    next(error);
  }
};

// GET /api/agent/executions - Get execution history
exports.getExecutionHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;
    
    const executions = await agentExecutor.getRecentExecutions(userId, parseInt(limit));
    
    res.json({
      executions,
      total: executions.length,
      summary: {
        totalExecutions: executions.length,
        successfulExecutions: executions.filter(e => e.status === 'completed').length,
        totalSavings: executions.reduce((sum, e) => sum + (e.savings || 0), 0)
      }
    });
  } catch (error) {
    logger.error('Failed to get execution history:', error);
    next(error);
  }
};

// GET /api/agent/financial-data - Get current financial observations
exports.getFinancialData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const financialData = await agentObserver.collectFinancialData(userId);
    
    res.json(financialData);
  } catch (error) {
    logger.error('Failed to get financial data:', error);
    next(error);
  }
};

// GET /api/agent/opportunities - Get detected opportunities
exports.getOpportunities = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get current financial data
    const financialData = await agentObserver.collectFinancialData(userId);
    
    // Detect opportunities
    const opportunities = await agentAnalyzer.detectOpportunities(userId, financialData);
    
    // Get opportunity statistics
    const stats = agentAnalyzer.getOpportunityStats(opportunities);
    
    res.json({
      opportunities,
      stats,
      detectedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get opportunities:', error);
    next(error);
  }
};

// GET /api/agent/decisions - Get recent decisions
exports.getDecisions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get current financial data
    const financialData = await agentObserver.collectFinancialData(userId);
    
    // Detect opportunities
    const opportunities = await agentAnalyzer.detectOpportunities(userId, financialData);
    
    // Evaluate decisions
    const decisions = await agentDecision.evaluateOpportunities(userId, opportunities, financialData);
    
    // Get decision statistics
    const stats = agentDecision.getDecisionStats(decisions);
    
    res.json({
      decisions,
      stats,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get decisions:', error);
    next(error);
  }
};

// POST /api/agent/stop - Stop autonomous agent (admin only)
exports.stopAgent = async (req, res, next) => {
  try {
    await agentScheduler.stop();
    
    logger.info('Autonomous agent stopped by admin request');
    
    res.json({
      success: true,
      message: 'Autonomous agent stopped',
      stoppedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to stop agent:', error);
    next(error);
  }
};

// POST /api/agent/start - Start autonomous agent (admin only)
exports.startAgent = async (req, res, next) => {
  try {
    await agentScheduler.start();
    
    logger.info('Autonomous agent started by admin request');
    
    res.json({
      success: true,
      message: 'Autonomous agent started',
      startedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to start agent:', error);
    next(error);
  }
};

// DELETE /api/agent/cache - Clear observation cache
exports.clearCache = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    agentObserver.clearCache(userId);
    
    logger.info(`Cache cleared for user ${userId}`);
    
    res.json({
      success: true,
      message: 'Cache cleared',
      clearedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to clear cache:', error);
    next(error);
  }
};

// Legacy methods for backward compatibility
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get current financial data
    const financialData = await agentObserver.collectFinancialData(userId);
    
    // Detect opportunities
    const opportunities = await agentAnalyzer.detectOpportunities(userId, financialData);
    
    // Convert to legacy format
    const recommendations = opportunities.map(opp => ({
      id: opp.id,
      text: opp.title,
      type: opp.potentialSavings > 0 ? 'positive' : 'info',
      action: opp.type,
      priority: opp.priority,
      data: opp.data,
      savings: opp.potentialSavings,
      reasoning: opp.description
    }));
    
    res.json(recommendations);
  } catch (error) {
    logger.error('Failed to get recommendations:', error);
    next(error);
  }
};