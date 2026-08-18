const express = require('express')
const router = express.Router()
const { addComment, getCommentsForContent, updateComment, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/authMiddleware')
const { body, param } = require('express-validator')
const { validateRequest } = require('../middleware/validationMiddleware')

const contentIdRule = param('contentId')
  .isInt({ min: 1 }).withMessage('Valid content ID is required')
  .toInt()

const commentIdRule = param('id')
  .isInt({ min: 1 }).withMessage('Valid comment ID is required')
  .toInt()

const commentTextRule = body('text')
  .trim()
  .notEmpty().withMessage('Comment text is required')
  .isLength({ max: 2000 }).withMessage('Comment must be 2000 characters or fewer')

const createCommentRules = [
  body('content_id')
    .isInt({ min: 1 }).withMessage('Valid content ID is required')
    .toInt(),
  commentTextRule
]

router.post('/', protect, createCommentRules, validateRequest, addComment)
router.get('/:contentId', contentIdRule, validateRequest, getCommentsForContent)
router.put('/:id', protect, commentIdRule, commentTextRule, validateRequest, updateComment)
router.delete('/:id', protect, commentIdRule, validateRequest, deleteComment)

module.exports = router
