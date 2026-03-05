const jwt = require('jsonwebtoken');
const { User, Treasury } = require('../models');
const logger = require('../utils/logger');

// POST /api/auth/connect
// Body: { address, walletType, companyName, email }
exports.connectWallet = async (req, res, next) => {
  try {
    const { address, walletType, companyName, email } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { walletAddress: address },
      defaults: { 
        companyName: companyName || 'Demo SME Ltd.',
        email: email || null,
      },
    });

    // If new user, create default treasury
    if (created) {
      await Treasury.create({
        userId: user.id,
        reservePercentage: 50,
        operationsPercentage: 30,
        smartRules: [
          { condition: 'Balance > 50000', action: 'Move 20% to reserve', active: true }
        ]
      });
      logger.info(`Created new user and treasury for ${address}`);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        companyName: user.companyName,
        email: user.email
      },
      created
    });
  } catch (error) {
    logger.error('Wallet connection error:', error);
    next(error);
  }
};

// POST /api/auth/login
// Body: { walletAddress }
exports.loginWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Find existing user
    const user = await User.findOne({
      where: { walletAddress },
      include: [{ model: Treasury }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please connect wallet first.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        companyName: user.companyName,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Wallet login error:', error);
    next(error);
  }
};