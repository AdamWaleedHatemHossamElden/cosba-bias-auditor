const express = require('express');
const router = express.Router();
const { submitReport, getAllReports, getMyReports, getMetrics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllReports);
router.get('/metrics', getMetrics);
router.get('/my', protect, getMyReports);
router.post('/', protect, submitReport);

module.exports = router;