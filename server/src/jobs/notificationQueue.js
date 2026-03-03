const Queue = require('bull');
const logger = require('../utils/logger');

const notificationQueue = new Queue('notifications', process.env.REDIS_URL);

notificationQueue.process(async (job) => {
  const { userId, message, type } = job.data;
  // In a real app, send email, SMS, or push notification
  logger.info(`Notification for user ${userId}: ${message} (${type})`);
});

module.exports = notificationQueue;