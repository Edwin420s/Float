const { Treasury } = require('../models');
const blockchainService = require('./blockchainService');

/**
 * Get treasury by user ID
 */
exports.getTreasuryByUserId = async (userId) => {
  return await Treasury.findOne({ where: { userId } });
};

/**
 * Create or update treasury
 */
exports.upsertTreasury = async (userId, data) => {
  const [treasury, created] = await Treasury.findOrCreate({
    where: { userId },
    defaults: data,
  });
  if (!created) {
    Object.assign(treasury, data);
    await treasury.save();
  }
  return treasury;
};

/**
 * Deploy on-chain treasury contract
 */
exports.deployTreasuryContract = async (userId) => {
  const treasury = await exports.getTreasuryByUserId(userId);
  if (!treasury) throw new Error('Treasury not found');
  const contractAddress = await blockchainService.deployAgentTreasury(userId);
  treasury.treasuryAddress = contractAddress;
  await treasury.save();
  return contractAddress;
};