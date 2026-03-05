const express = require('express');
const { getRecommendations, executeAgentAction } = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /api/agent/recommendations - Get AI agent recommendations
router.get('/recommendations', authMiddleware, asyncHandler(getRecommendations));

// POST /api/agent/execute - Execute agent action (payment, allocation, etc.)
router.post('/execute', authMiddleware, asyncHandler(executeAgentAction));

module.exports = router;