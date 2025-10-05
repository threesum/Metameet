const xss = require('xss');
const { sanitizeInput } = require('../utils/helpers');

// NoSQL injection prevention middleware
const noSQLInjectionProtection = (req, res, next) => {
  // Check for potential NoSQL injection in query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string' && req.query[key].includes('$')) {
        return res.status(400).json({ error: "Invalid query parameters" });
      }
    }
  }
  next();
};

// Input sanitization middleware
const inputSanitization = (req, res, next) => {
  // Sanitize body data
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    }
  }
  
  next();
};

module.exports = {
  noSQLInjectionProtection,
  inputSanitization
};
