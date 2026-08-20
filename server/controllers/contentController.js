const pool = require('../config/db');
const { sendInternalError } = require('../utils/errorResponse');
const { deleteUploadFile } = require('../utils/uploadFiles');

// Upload content
const uploadContent = async (req, res) => {
  const { type, text_content, prompt, ai_model } = req.body;
  const user_id = req.user.id;

  try {
    const file_path = req.file ? req.file.filename : null;

    if (!['text', 'image', 'file'].includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    if ((type === 'image' || type === 'file') && !file_path) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (type === 'text' && !text_content) {
      return res.status(400).json({ message: 'Text content is required' });
    }

    await pool.query(
      'INSERT INTO content (user_id, type, file_path, text_content, prompt, ai_model) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, type, file_path, text_content, prompt, ai_model]
    );

    res.status(201).json({ message: 'Content uploaded successfully ✅' });
  } catch (err) {
    return sendInternalError(res, 'Failed to upload content', err);
  }
};

// Get all content
const getAllContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT content.*, users.username FROM content JOIN users ON content.user_id = users.id ORDER BY content.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    return sendInternalError(res, 'Failed to load content', err);
  }
};

// Get one content item
const getContentById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT content.*, users.username
       FROM content
       JOIN users ON content.user_id = users.id
       WHERE content.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    return sendInternalError(res, 'Failed to load content item', err);
  }
};

// Get current user's content
const getMyContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM content WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    return sendInternalError(res, 'Failed to load user content', err);
  }
};

// Delete current user's content
const deleteMyContent = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, file_path FROM content WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await pool.query('DELETE FROM content WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);

    await deleteUploadFile(rows[0].file_path);

    res.json({ message: 'Content deleted successfully' });
  } catch (err) {
    return sendInternalError(res, 'Failed to delete content', err);
  }
};

module.exports = { uploadContent, getAllContent, getContentById, getMyContent, deleteMyContent };
