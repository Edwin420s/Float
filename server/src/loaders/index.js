const { sequelize } = require('../models');
const logger = require('../utils/logger');
const paymentQueue = require('../jobs/paymentQueue');
const notificationQueue = require('../jobs/notificationQueue');
const agentScheduler = require('../services/agentScheduler');
const blockchainService = require('../services/blockchainService');

module.exports = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync database (for development - in production use migrations)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Initialize treasury contract service
    await blockchainService.initializeTreasuryService();

    // Start queues (they will listen for jobs)
    paymentQueue.on('error', (err) => logger.error('Payment queue error', err));
    notificationQueue.on('error', (err) => logger.error('Notification queue error', err));

    // Start autonomous agent scheduler
    await agentScheduler.start();
    logger.info('Autonomous agent scheduler started');

    logger.info('All loaders initialized successfully');
  } catch (error) {
    logger.error('Loader initialization failed', error);
    process.exit(1);
  }
};