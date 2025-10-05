const { body, validationResult } = require('express-validator');

// Signup validation rules
const signupValidation = [
  body('username') // Keep as 'username' for frontend compatibility, but validate as email
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Login validation rules
const loginValidation = [
  body('username') // Keep as 'username' for frontend compatibility, but validate as email
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  handleValidationErrors
};
