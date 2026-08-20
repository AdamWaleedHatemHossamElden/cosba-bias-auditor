const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { body } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');

const registerRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 100 }).withMessage('Username must be 100 characters or fewer'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .isLength({ max: 255 }).withMessage('Email must be 255 characters or fewer'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/register', registerRules, validateRequest, register);
router.post('/login', loginRules, validateRequest, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileRules, validateRequest, updateProfile);

module.exports = router;
