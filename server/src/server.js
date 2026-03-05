const app = require('./app');
const loaders = require('./loaders');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

loaders().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}).catch(err => {
  logger.error('Application startup failed', err);
  process.exit(1);
});