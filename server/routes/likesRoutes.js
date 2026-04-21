const express = require('express')
const router = express.Router()
const { toggleLike, getLikes } = require('../controllers/likesController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, toggleLike)
router.get('/:contentId', protect, getLikes)

module.exports = router