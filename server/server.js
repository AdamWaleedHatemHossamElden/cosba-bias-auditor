const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likesRoutes = require('./routes/likesRoutes');

const { protect } = require('./middleware/authMiddleware');

const app = express();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likesRoutes);

app.get('/', (req, res) => {
  res.send('CoS-BA API is running...');
});

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, you are authorized ✅` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
