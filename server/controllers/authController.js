const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendInternalError } = require('../utils/errorResponse');

// Register
const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully ✅' });
  } catch (err) {
    return sendInternalError(res, 'Failed to register user', err);
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    return sendInternalError(res, 'Failed to log in user', err);
  }
};

// Get current logged-in user
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    return sendInternalError(res, 'Failed to load current user', err);
  }
};

// Update profile
const updateProfile = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [email, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [username, email, hashed, req.user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, email = ? WHERE id = ?',
        [username, email, req.user.id]
      );
    }
    const [updated] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ message: 'Profile updated ✅', user: updated[0] });
  } catch (err) {
    return sendInternalError(res, 'Failed to update profile', err);
  }
};

module.exports = { register, login, getMe, updateProfile };
