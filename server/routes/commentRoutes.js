const express = require('express')
const router = express.Router()
const { addComment, getCommentsForContent, updateComment, deleteComment } = require('../controllers/commentController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, addComment)
router.get('/:contentId', getCommentsForContent)
router.put('/:id', protect, updateComment)
router.delete('/:id', protect, deleteComment)

module.exports = router
