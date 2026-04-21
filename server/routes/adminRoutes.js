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

// User management
router.get('/users', protect, adminOnly, getAllUsers)
router.post('/create-admin', protect, adminOnly, createAdmin)
router.put('/users/:id/make-admin', protect, adminOnly, makeAdmin)
router.delete('/users/:id', protect, adminOnly, deleteUser)

// Content & report management
router.delete('/content/:id', protect, adminOnly, deleteContent)
router.put('/report/:id/status', protect, adminOnly, updateReportStatus)
router.delete('/report/:id', protect, adminOnly, deleteReport)

module.exports = router
