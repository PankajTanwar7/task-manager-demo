const { body, param, validationResult } = require('express-validator');
const xss = require('xss');

// Validation rules for creating a task
exports.validateCreateTask = [
  body('title')
    .trim()
    .customSanitizer(value => xss(value))
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .customSanitizer(value => xss(value))
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    next();
  }
];

// Validation rules for updating a task
exports.validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .customSanitizer(value => xss(value))
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .customSanitizer(value => xss(value))
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

  body('completed')
    .optional()
    .toBoolean()
    .isBoolean().withMessage('Completed must be a boolean'),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    next();
  }
];

// Validation for task ID parameter
exports.validateTaskId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer')
    .toInt(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }

    next();
  }
];
