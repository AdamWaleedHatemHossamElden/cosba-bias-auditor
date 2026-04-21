const pool = require('../config/db')

// POST /comments
const addComment = async (req, res) => {
  const { content_id, text } = req.body
  const user_id = req.user.id
  if (!text) return res.status(400).json({ message: 'Comment text is required' })

  try {
    await pool.query(
      'INSERT INTO comments (content_id, user_id, text) VALUES (?, ?, ?)',
      [content_id, user_id, text]
    )
    res.status(201).json({ message: 'Comment added ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /comments/:contentId
const getCommentsForContent = async (req, res) => {
  const { contentId } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.content_id = ?
       ORDER BY comments.created_at ASC`,
      [contentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /comments/:id
const updateComment = async (req, res) => {
  const { text } = req.body
  const commentId = req.params.id
  const userId = req.user.id

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' })
  }

  try {
    const [result] = await pool.query(
      'UPDATE comments SET text = ? WHERE id = ? AND user_id = ?',
      [text.trim(), commentId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    res.json({ message: 'Comment updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /comments/:id
const deleteComment = async (req, res) => {
  const commentId = req.params.id
  const userId = req.user.id

  try {
    const [result] = await pool.query(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    res.json({ message: 'Comment deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { addComment, getCommentsForContent, updateComment, deleteComment }
