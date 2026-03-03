const express = require('express');
const { getRecommendation } = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/recommendation', authMiddleware, asyncHandler(getRecommendation));

module.exports = router;