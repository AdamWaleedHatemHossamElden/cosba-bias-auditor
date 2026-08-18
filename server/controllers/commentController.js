const pool = require('../config/db')
const { sendInternalError } = require('../utils/errorResponse')

// POST /comments
const addComment = async (req, res) => {
  const { content_id, text } = req.body
  const user_id = req.user.id

  try {
    await pool.query(
      'INSERT INTO comments (content_id, user_id, text) VALUES (?, ?, ?)',
      [content_id, user_id, text]
    )
    res.status(201).json({ message: 'Comment added ✅' })
  } catch (err) {
    return sendInternalError(res, 'Failed to add comment', err)
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
    return sendInternalError(res, 'Failed to load comments', err)
  }
}

// PUT /comments/:id
const updateComment = async (req, res) => {
  const { text } = req.body
  const commentId = req.params.id
  const userId = req.user.id

  try {
    const [result] = await pool.query(
      'UPDATE comments SET text = ? WHERE id = ? AND user_id = ?',
      [text, commentId, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    res.json({ message: 'Comment updated' })
  } catch (err) {
    return sendInternalError(res, 'Failed to update comment', err)
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
    return sendInternalError(res, 'Failed to delete comment', err)
  }
}

module.exports = { addComment, getCommentsForContent, updateComment, deleteComment }
