const cron = require('node-cron');
const logger = require('../utils/logger');
const { User, Treasury } = require('../models');
const agentObserver = require('./agentObserver');
const agentAnalyzer = require('./agentAnalyzer');
const agentDecision = require('./agentDecision');
const agentExecutor = require('./agentExecutor');

class AgentScheduler {
  constructor() {
    this.isRunning = false;
    this.activeJobs = new Map();
    this.cronJobs = new Map();
  }

  /**
   * Start the autonomous agent scheduler
   * Runs continuous monitoring cycles for all active users
   */
  async start() {
    if (this.isRunning) {
      logger.warn('Agent scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting autonomous agent scheduler...');

    // Main monitoring cycle - runs every 5 minutes
    const mainJob = cron.schedule('*/5 * * * *', async () => {
      await this.runMonitoringCycle();
    }, {
      scheduled: false
    });

    // Opportunity detection - runs every 10 minutes
    const opportunityJob = cron.schedule('*/10 * * * *', async () => {
      await this.runOpportunityDetection();
    }, {
      scheduled: false
    });

    // Liquidity check - runs every hour
    const liquidityJob = cron.schedule('0 * * * *', async () => {
      await this.runLiquidityCheck();
    }, {
      scheduled: false
    });

    this.cronJobs.set('main', mainJob);
    this.cronJobs.set('opportunity', opportunityJob);
    this.cronJobs.set('liquidity', liquidityJob);

    // Start all jobs
    this.cronJobs.forEach(job => job.start());

    // Run initial cycle
    await this.runMonitoringCycle();

    logger.info('Agent scheduler started successfully');
  }

  /**
   * Stop the autonomous agent scheduler
   */
  async stop() {
    if (!this.isRunning) {
      logger.warn('Agent scheduler is not running');
      return;
    }

    this.isRunning = false;
    logger.info('Stopping autonomous agent scheduler...');

    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs.clear();

    // Wait for active jobs to complete
    const activeJobPromises = Array.from(this.activeJobs.values());
    if (activeJobPromises.length > 0) {
      logger.info(`Waiting for ${activeJobPromises.length} active jobs to complete...`);
      await Promise.allSettled(activeJobPromises);
    }

    this.activeJobs.clear();
    logger.info('Agent scheduler stopped');
  }

  /**
   * Main monitoring cycle - Observe → Detect → Evaluate → Execute
   */
  async runMonitoringCycle() {
    try {
      logger.info('Starting autonomous monitoring cycle...');
      
      // Get all active users with treasuries
      const users = await User.findAll({
        include: [{
          model: Treasury,
          where: { isActive: true },
          required: true
        }]
      });

      logger.info(`Processing ${users.length} users for autonomous monitoring`);

      // Process each user concurrently
      const userPromises = users.map(user => this.processUserCycle(user));
      await Promise.allSettled(userPromises);

      logger.info('Autonomous monitoring cycle completed');
    } catch (error) {
      logger.error('Monitoring cycle failed:', error);
    }
  }

  /**
   * Process individual user's agent cycle
   */
  async processUserCycle(user) {
    const userId = user.id;
    
    // Prevent duplicate processing
    if (this.activeJobs.has(userId)) {
      logger.debug(`User ${userId} cycle already in progress`);
      return;
    }

    const jobPromise = this.executeUserCycle(user);
    this.activeJobs.set(userId, jobPromise);

    try {
      await jobPromise;
    } catch (error) {
      logger.error(`User ${userId} cycle failed:`, error);
    } finally {
      this.activeJobs.delete(userId);
    }
  }

  /**
   * Execute the complete agent cycle for a user
   */
  async executeUserCycle(user) {
    const userId = user.id;
    logger.debug(`Starting agent cycle for user ${userId}`);

    // 1️⃣ OBSERVE: Collect financial data
    const financialData = await agentObserver.collectFinancialData(userId);
    logger.debug(`Collected financial data for user ${userId}:`, {
      balance: financialData.totalBalance,
      transactions: financialData.recentTransactions.length,
      invoices: financialData.upcomingInvoices.length
    });

    // 2️⃣ DETECT: Identify opportunities
    const opportunities = await agentAnalyzer.detectOpportunities(userId, financialData);
    logger.debug(`Detected ${opportunities.length} opportunities for user ${userId}`);

    // 3️⃣ EVALUATE: Decision engine with safety checks
    const decisions = await agentDecision.evaluateOpportunities(userId, opportunities, financialData);
    logger.debug(`Evaluated ${decisions.length} decisions for user ${userId}`);

    // 4️⃣ EXECUTE: Autonomous execution of approved decisions
    const executions = await agentExecutor.executeDecisions(userId, decisions);
    logger.debug(`Executed ${executions.length} actions for user ${userId}`);

    // Log cycle summary
    const summary = {
      userId,
      cycleTime: new Date().toISOString(),
      observations: {
        balance: financialData.totalBalance,
        transactions: financialData.recentTransactions.length,
        invoices: financialData.upcomingInvoices.length
      },
      opportunities: opportunities.length,
      decisions: decisions.length,
      executions: executions.length,
      savings: executions.reduce((total, exec) => total + (exec.savings || 0), 0)
    };

    logger.info('Agent cycle completed:', summary);
    return summary;
  }

  /**
   * Run opportunity detection cycle
   */
  async runOpportunityDetection() {
    try {
      logger.debug('Running opportunity detection cycle...');
      
      const users = await User.findAll({
        include: [{
          model: Treasury,
          where: { isActive: true },
          required: true
        }]
      });

      for (const user of users) {
        const financialData = await agentObserver.collectFinancialData(user.id);
        const opportunities = await agentAnalyzer.detectOpportunities(user.id, financialData);
        
        if (opportunities.length > 0) {
          logger.info(`Found ${opportunities.length} new opportunities for user ${user.id}`);
        }
      }
    } catch (error) {
      logger.error('Opportunity detection cycle failed:', error);
    }
  }

  /**
   * Run liquidity check cycle
   */
  async runLiquidityCheck() {
    try {
      logger.debug('Running liquidity check cycle...');
      
      const users = await User.findAll({
        include: [{
          model: Treasury,
          where: { isActive: true },
          required: true
        }]
      });

      for (const user of users) {
        const financialData = await agentObserver.collectFinancialData(user.id);
        
        // Check for liquidity warnings
        if (financialData.liquidityRatio < 0.3) {
          logger.warn(`Low liquidity warning for user ${user.id}: ${financialData.liquidityRatio}`);
          
          // Could trigger alert here
          // await notificationService.sendLiquidityAlert(user.id, financialData);
        }
      }
    } catch (error) {
      logger.error('Liquidity check cycle failed:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.activeJobs.size,
      scheduledJobs: this.cronJobs.size,
      uptime: this.isRunning ? process.uptime() : 0
    };
  }

  /**
   * Force run monitoring cycle for specific user
   */
  async runUserCycle(userId) {
    const user = await User.findByPk(userId, {
      include: [{
        model: Treasury,
        where: { isActive: true },
        required: true
      }]
    });

    if (!user) {
      throw new Error('User not found or treasury not active');
    }

    return await this.executeUserCycle(user);
  }
}

module.exports = new AgentScheduler();
