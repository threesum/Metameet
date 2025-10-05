const { ValidationError, DatabaseError } = require('../utils/helpers');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error without sensitive details
  console.error('[ERROR]', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'DatabaseError') {
    return res.status(500).json({ error: "Database operation failed" });
  }
  
  if (err.code === 11000) { // MongoDB duplicate key error
    return res.status(409).json({ error: "User already exists" });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({ error: "Database operation failed" });
  }
  
  // Default error
  return res.status(500).json({ error: "Internal server error" });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
