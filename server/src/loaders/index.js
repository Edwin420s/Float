const { sequelize } = require('../models');
const logger = require('../utils/logger');
const paymentQueue = require('../jobs/paymentQueue');
const notificationQueue = require('../jobs/notificationQueue');

module.exports = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    // Start queues (they will listen for jobs)
    paymentQueue.on('error', (err) => logger.error('Payment queue error', err));
    notificationQueue.on('error', (err) => logger.error('Notification queue error', err));

    logger.info('All loaders initialized');
  } catch (error) {
    logger.error('Loader initialization failed', error);
    process.exit(1);
  }
};