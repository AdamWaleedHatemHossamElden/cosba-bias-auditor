const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadContent, getAllContent, getContentById, getMyContent, deleteMyContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, '-')
      .slice(0, 60);
    cb(null, `${Date.now()}-${safeName}${ext}`);
  },
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
]);

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WEBP, GIF, PDF, and MP4 files are allowed'));
    }
    cb(null, true);
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/', protect, handleUpload, uploadContent);
router.get('/', getAllContent);
router.get('/my', protect, getMyContent);
router.get('/:id', getContentById);
router.delete('/:id', protect, deleteMyContent);

module.exports = router;
