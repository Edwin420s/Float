const express = require('express');
const { getTreasury, updateTreasury, deployTreasuryContract } = require('../controllers/treasuryController');
const authMiddleware = require('../middleware/authMiddleware');
const { updateTreasuryValidator } = require('../validators/treasuryValidator');
const { validate } = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);

router.get('/', asyncHandler(getTreasury));
router.put('/', validate(updateTreasuryValidator), asyncHandler(updateTreasury));
router.post('/deploy', asyncHandler(deployTreasuryContract));

module.exports = router;