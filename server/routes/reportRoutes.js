const express = require('express');
const { getAnalytics, getTeamPerformance } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAnalytics);
router.get('/team-performance', protect, getTeamPerformance);

module.exports = router;