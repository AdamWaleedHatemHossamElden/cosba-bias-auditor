const express = require('express')
const router = express.Router()
const {
  getAllUsers,
  createAdmin,
  makeAdmin,
  deleteUser,
  deleteContent,
  deleteReport,
  updateReportStatus
} = require('../controllers/adminController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { body } = require('express-validator')
const { validateRequest } = require('../middleware/validationMiddleware')

const createAdminRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 100 }).withMessage('Username must be 100 characters or fewer'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .isLength({ max: 255 }).withMessage('Email must be 255 characters or fewer'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

// User management
router.get('/users', protect, adminOnly, getAllUsers)
router.post('/create-admin', protect, adminOnly, createAdminRules, validateRequest, createAdmin)
router.put('/users/:id/make-admin', protect, adminOnly, makeAdmin)
router.delete('/users/:id', protect, adminOnly, deleteUser)

// Content & report management
router.delete('/content/:id', protect, adminOnly, deleteContent)
router.put('/report/:id/status', protect, adminOnly, updateReportStatus)
router.delete('/report/:id', protect, adminOnly, deleteReport)

module.exports = router
