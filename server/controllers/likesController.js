const pool = require('../config/db')
const { sendInternalError } = require('../utils/errorResponse')

// Toggle like (like if not liked, unlike if liked)
const toggleLike = async (req, res) => {
  const { content_id } = req.body
  const user_id = req.user.id

  try {
    // Check if already liked
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE content_id = ? AND user_id = ?',
      [content_id, user_id]
    )

    if (existing.length > 0) {
      // Unlike
      await pool.query('DELETE FROM likes WHERE content_id = ? AND user_id = ?', [content_id, user_id])
      res.json({ action: 'unliked' })
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (content_id, user_id) VALUES (?, ?)',
        [content_id, user_id]
      )
      res.json({ action: 'liked' })
    }
  } catch (err) {
    return sendInternalError(res, 'Failed to update like', err)
  }
}

// Get like count + if current user liked for specific content
const getLikes = async (req, res) => {
  const { contentId } = req.params
  const user_id = req.user?.id || null

  try {
    const [count] = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE content_id = ?',
      [contentId]
    )

    const [userLiked] = await pool.query(
      'SELECT id FROM likes WHERE content_id = ? AND user_id = ?',
      [contentId, user_id]
    )

    res.json({
      count: count[0].count,
      userLiked: userLiked.length > 0
    })
  } catch (err) {
    return sendInternalError(res, 'Failed to load likes', err)
  }
}

module.exports = { toggleLike, getLikes }
