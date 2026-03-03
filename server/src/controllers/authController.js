const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// POST /api/auth/wallet
// Body: { walletAddress, signature? } (simplified – in real world verify signature)
exports.authenticateWallet = async (req, res, next) => {
  try {
    const { walletAddress, companyName, email } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { walletAddress },
      defaults: { companyName, email },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};