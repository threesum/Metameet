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
      const { username, password } = req.body;

      // Validate required fields
      validateRequiredFields({ username, password }, ['username', 'password']);

      await session.withTransaction(async () => {
        // Check if user already exists (within transaction)
        const existingUser = await User.findOne({ email: username }).session(session);
        if (existingUser) {
          throw new ValidationError('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
          email: username, // Use the email from username field
          password: hashedPassword
        });

        await newUser.save({ session });

        // Generate JWT token for automatic login
        const token = generateToken(newUser._id, newUser.email);

        return res.status(201).json({ 
          message: "Signup successful", 
          user: { email: newUser.email },
          token: token,
          expiresIn: process.env.JWT_EXPIRES_IN
        });
      });

    } catch (error) {
      console.error("Signup error:", {
        name: error.name,
        message: error.message,
        username: req.body.username // Log username from request body for debugging but not password
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

      // Find user by email
      const user = await User.findOne({ email: username });
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
        user: { email: user.email },
        token: token,
        expiresIn: process.env.JWT_EXPIRES_IN
      });
    } catch (error) {
      console.error("Login error:", {
        name: error.name,
        message: error.message,
        username: req.body.username // Log username from request body for debugging but not password
      });
      next(error);
    }
  }
);

module.exports = router;
