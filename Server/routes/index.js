const express = require('express');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
