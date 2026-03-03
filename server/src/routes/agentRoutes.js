const express = require('express');
const { getRecommendation } = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/recommendation', authMiddleware, getRecommendation);

module.exports = router;