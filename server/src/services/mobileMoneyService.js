// Simulated mobile money operations
const logger = require('../utils/logger');

// Check balance for a given mobile number (simulated)
exports.getBalance = async (mobileNumber, network) => {
  // Mock: return random balance based on network
  logger.info(`Checking ${network} balance for ${mobileNumber}`);
  const balances = {
    mpesa: 45000, // KES
    airtel: 32000,
    mtn: 28000,
  };
  return balances[network] || 0;
};

// Send money via mobile money (simulated)
exports.sendMoney = async (fromNumber, toNumber, amount, network) => {
  logger.info(`Sending ${amount} KES via ${network} from ${fromNumber} to ${toNumber}`);
  // In a real integration, call M-Pesa API etc.
  // For hackathon, always succeed
  return {
    success: true,
    transactionId: `MM${Date.now()}`,
    message: `Sent ${amount} KES via ${network}`,
  };
};