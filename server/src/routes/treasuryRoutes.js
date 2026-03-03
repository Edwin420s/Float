const express = require('express');
const {
  getTreasury,
  updateTreasury,
  deployTreasuryContract,
} = require('../controllers/treasuryController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware); // all routes below require auth

router.get('/', getTreasury);
router.put('/', updateTreasury);
router.post('/deploy', deployTreasuryContract);

module.exports = router;