const express = require('express');
const router = express.Router();
const { submitReport, getAllReports, getMyReports, getMetrics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

const submitReportRules = [
  body('content_id')
    .isInt({ min: 1 }).withMessage('Valid content ID is required')
    .toInt(),
  body('bias_category')
    .trim()
    .notEmpty().withMessage('Bias category is required')
    .isLength({ max: 120 }).withMessage('Bias category must be 120 characters or fewer'),
  body('secondary_category')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 120 }).withMessage('Secondary category must be 120 characters or fewer'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description must be 5000 characters or fewer'),
];

router.get('/', getAllReports);
router.get('/metrics', getMetrics);
router.get('/my', protect, getMyReports);
router.post('/', protect, submitReportRules, validateRequest, submitReport);

module.exports = router;
