const pool = require('../config/db')
const bcrypt = require('bcryptjs')

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Create new admin account
const createAdmin = async (req, res) => {
  const { username, email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'admin']
    )
    res.status(201).json({ message: 'Admin account created ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Promote user to admin
const makeAdmin = async (req, res) => {
  try {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', req.params.id])
    res.json({ message: 'User promoted to admin ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete a user
const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: 'User deleted ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete content
const deleteContent = async (req, res) => {
  try {
    await pool.query('DELETE FROM content WHERE id = ?', [req.params.id])
    res.json({ message: 'Content deleted successfully ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete report
const deleteReport = async (req, res) => {
  try {
    await pool.query('DELETE FROM reports WHERE id = ?', [req.params.id])
    res.json({ message: 'Report deleted successfully ✅' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Update report status
const updateReportStatus = async (req, res) => {
  const allowedStatuses = ['pending', 'reviewed', 'resolved', 'dismissed']
  const { status } = req.body

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid report status' })
  }

  try {
    const [result] = await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Report not found' })
    }
    res.json({ message: 'Report status updated', status })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getAllUsers, createAdmin, makeAdmin, deleteUser, deleteContent, deleteReport, updateReportStatus }
