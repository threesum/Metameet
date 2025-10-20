const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { signupValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { signupLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { ValidationError, DatabaseError, generateToken, validateRequiredFields } = require('../utils/helpers');

const router = express.Router();

// Sign Up
router.post("/signup", 
  signupLimiter,
  signupValidation,
  handleValidationErrors,
  async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
      const { username, email, password } = req.body;

      // Validate required fields
      validateRequiredFields({ username, email, password }, ['username', 'email', 'password']);

      await session.withTransaction(async () => {
        // Check if username already exists
        const existingUsername = await User.findOne({ username }).session(session);
        if (existingUsername) {
          throw new ValidationError('Username already exists');
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email }).session(session);
        if (existingEmail) {
          throw new ValidationError('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
          username,
          email,
          password: hashedPassword
        });

        await newUser.save({ session });

        // Generate JWT token for automatic login
        const token = generateToken(newUser._id, newUser.email);

        return res.status(201).json({ 
          message: "Signup successful", 
          user: { username: newUser.username, email: newUser.email },
          token: token,
          expiresIn: process.env.JWT_EXPIRES_IN
        });
      });

    } catch (error) {
      console.error("Signup error:", {
        name: error.name,
        message: error.message,
        username: req.body.username
      });
      next(error);
    } finally {
      await session.endSession();
    }
  }
);

// Login
router.post("/login", 
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Validate required fields
      validateRequiredFields({ username, password }, ['username', 'password']);

      // Find user by username or email
      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      });
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user._id, user.email);

      return res.status(200).json({ 
        message: "Login successful", 
        user: { username: user.username, email: user.email },
        token: token,
        expiresIn: process.env.JWT_EXPIRES_IN
      });
    } catch (error) {
      console.error("Login error:", {
        name: error.name,
        message: error.message,
        username: req.body.username
      });
      next(error);
    }
  }
);

module.exports = router;
