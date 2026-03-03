const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Unknown error
  res.status(500).json({ error: 'Internal Server Error' });
};