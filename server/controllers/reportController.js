const pool = require('../config/db');
const { sendInternalError } = require('../utils/errorResponse');

// Submit a report
const submitReport = async (req, res) => {
  const { content_id, bias_category, secondary_category, description } = req.body;
  const user_id = req.user.id;
  try {
    const [content] = await pool.query('SELECT * FROM content WHERE id = ?', [content_id]);
    if (content.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }
    await pool.query(
      'INSERT INTO reports (user_id, content_id, bias_category, secondary_category, description) VALUES (?, ?, ?, ?, ?)',
      [user_id, content_id, bias_category, secondary_category, description]
    );
    res.status(201).json({ message: 'Report submitted successfully ✅' });
  } catch (err) {
    return sendInternalError(res, 'Failed to submit report', err);
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT reports.*, users.username, content.prompt, content.type
      FROM reports
      JOIN users ON reports.user_id = users.id
      JOIN content ON reports.content_id = content.id
      ORDER BY reports.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    return sendInternalError(res, 'Failed to load reports', err);
  }
};

// Get current user's reports
const getMyReports = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    return sendInternalError(res, 'Failed to load user reports', err);
  }
};

// Get dashboard metrics
const getMetrics = async (req, res) => {
  try {
    const [prevalence] = await pool.query(`
      SELECT bias_category, COUNT(*) as count
      FROM reports GROUP BY bias_category ORDER BY count DESC
    `);
    const [density] = await pool.query(`
      SELECT content_id, COUNT(*) as flag_count
      FROM reports GROUP BY content_id ORDER BY flag_count DESC
    `);
    const [consensus] = await pool.query(`
      SELECT content_id, COUNT(DISTINCT user_id) as unique_flaggers
      FROM reports GROUP BY content_id ORDER BY unique_flaggers DESC
    `);
    const [topPrompts] = await pool.query(`
      SELECT content.prompt, content.ai_model, COUNT(reports.id) as flag_count
      FROM reports JOIN content ON reports.content_id = content.id
      GROUP BY content.id ORDER BY flag_count DESC LIMIT 5
    `);
    const [contentTypes] = await pool.query(`
      SELECT content.type, COUNT(reports.id) as count
      FROM reports
      JOIN content ON reports.content_id = content.id
      GROUP BY content.type
      ORDER BY count DESC
    `);
    const [modelBreakdown] = await pool.query(`
      SELECT COALESCE(NULLIF(content.ai_model, ''), 'Unknown') as ai_model, COUNT(reports.id) as count
      FROM reports
      JOIN content ON reports.content_id = content.id
      GROUP BY COALESCE(NULLIF(content.ai_model, ''), 'Unknown')
      ORDER BY count DESC
      LIMIT 8
    `);
    const [timeline] = await pool.query(`
      SELECT DATE(created_at) as report_date, COUNT(*) as count
      FROM reports
      GROUP BY DATE(created_at)
      ORDER BY report_date ASC
      LIMIT 14
    `);
    const [statusBreakdown] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM reports
      GROUP BY status
      ORDER BY count DESC
    `);
    res.json({ prevalence, density, consensus, topPrompts, contentTypes, modelBreakdown, timeline, statusBreakdown });
  } catch (err) {
    return sendInternalError(res, 'Failed to load report metrics', err);
  }
};

module.exports = { submitReport, getAllReports, getMyReports, getMetrics };
