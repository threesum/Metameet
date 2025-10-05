const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Protected route - Get user profile
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ 
      message: "Profile retrieved successfully", 
      user: { email: user.email }
    });
  } catch (error) {
    console.error("Profile error:", {
      name: error.name,
      message: error.message,
      userId: req.user.userId // Log userId for debugging but not sensitive data
    });
    next(error);
  }
});

module.exports = router;
