const express = require('express');
const { 
  getRecommendations, 
  getAgentStatus,
  forceAgentCycle,
  getExecutionHistory,
  getFinancialData,
  getOpportunities,
  getDecisions,
  stopAgent,
  startAgent,
  clearCache
} = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Legacy endpoint for backward compatibility
// GET /api/agent/recommendations - Get AI agent recommendations
router.get('/recommendations', authMiddleware, asyncHandler(getRecommendations));

// New autonomous agent endpoints
// GET /api/agent/status - Get autonomous agent status
router.get('/status', authMiddleware, asyncHandler(getAgentStatus));

// POST /api/agent/force-cycle - Force run agent cycle for user
router.post('/force-cycle', authMiddleware, asyncHandler(forceAgentCycle));

// GET /api/agent/executions - Get execution history
router.get('/executions', authMiddleware, asyncHandler(getExecutionHistory));

// GET /api/agent/financial-data - Get current financial observations
router.get('/financial-data', authMiddleware, asyncHandler(getFinancialData));

// GET /api/agent/opportunities - Get detected opportunities
router.get('/opportunities', authMiddleware, asyncHandler(getOpportunities));

// GET /api/agent/decisions - Get recent decisions
router.get('/decisions', authMiddleware, asyncHandler(getDecisions));

// Admin endpoints (require additional admin middleware in production)
// POST /api/agent/stop - Stop autonomous agent
router.post('/stop', authMiddleware, asyncHandler(stopAgent));

// POST /api/agent/start - Start autonomous agent
router.post('/start', authMiddleware, asyncHandler(startAgent));

// DELETE /api/agent/cache - Clear observation cache
router.delete('/cache', authMiddleware, asyncHandler(clearCache));

module.exports = router;