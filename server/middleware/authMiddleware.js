const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendInternalError } = require('../utils/errorResponse');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return sendInternalError(res, 'Failed to authorize user', err);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
