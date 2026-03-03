const { Treasury } = require('../models');
const blockchainService = require('../services/blockchainService');

// GET /api/treasury
exports.getTreasury = async (req, res, next) => {
  try {
    const treasury = await Treasury.findOne({ where: { userId: req.user.userId } });
    if (!treasury) {
      return res.status(404).json({ error: 'Treasury not found' });
    }
    res.json(treasury);
  } catch (error) {
    next(error);
  }
};

// PUT /api/treasury
exports.updateTreasury = async (req, res, next) => {
  try {
    const { reservePercentage, operationsPercentage, smartRules } = req.body;
    const treasury = await Treasury.findOne({ where: { userId: req.user.userId } });
    if (!treasury) {
      // Create if not exists
      const newTreasury = await Treasury.create({
        userId: req.user.userId,
        reservePercentage,
        operationsPercentage,
        smartRules,
      });
      return res.json(newTreasury);
    }

    treasury.reservePercentage = reservePercentage ?? treasury.reservePercentage;
    treasury.operationsPercentage = operationsPercentage ?? treasury.operationsPercentage;
    treasury.smartRules = smartRules ?? treasury.smartRules;
    await treasury.save();

    res.json(treasury);
  } catch (error) {
    next(error);
  }
};

// POST /api/treasury/deploy (deploy smart wallet contract)
exports.deployTreasuryContract = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const treasury = await Treasury.findOne({ where: { userId } });
    if (!treasury) {
      return res.status(404).json({ error: 'Treasury not found' });
    }

    // Call blockchain service to deploy AgentTreasury contract
    const contractAddress = await blockchainService.deployAgentTreasury(userId);
    treasury.treasuryAddress = contractAddress;
    await treasury.save();

    res.json({ treasuryAddress: contractAddress });
  } catch (error) {
    next(error);
  }
};