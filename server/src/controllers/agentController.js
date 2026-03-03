const agentService = require('../services/agentService');

// GET /api/agent/recommendation
exports.getRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const recommendation = await agentService.generateRecommendation(userId);
    res.json(recommendation);
  } catch (error) {
    next(error);
  }
};