const xss = require('xss');

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return xss(input.trim());
};

// Generate JWT token
const generateToken = (userId, username) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`${missingFields.join(', ')} are required`);
  }
};

module.exports = {
  ValidationError,
  DatabaseError,
  sanitizeInput,
  generateToken,
  validateRequiredFields
};
