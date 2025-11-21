/**
 * Validation Middleware
 *
 * Provides input validation and sanitization for all task-related endpoints.
 * Uses express-validator for validation rules and XSS library for security.
 *
 * Features:
 * - XSS protection: Sanitizes all text input to prevent cross-site scripting
 * - Length validation: Enforces min/max character limits
 * - Type validation: Ensures correct data types
 * - Detailed error messages: Returns field-specific validation errors
 *
 * Exports three validation middleware chains:
 * - validateCreateTask: For POST /api/tasks
 * - validateUpdateTask: For PUT /api/tasks/:id
 * - validateTaskId: For any route with :id parameter
 *
 * @module middleware/validation
 */

const { body, param, validationResult } = require('express-validator');
const xss = require('xss');

/**
 * Validation rules for creating a task
 *
 * Validates POST /api/tasks request body:
 * - title: Required, 1-200 characters, XSS sanitized
 * - description: Optional, max 1000 characters, XSS sanitized
 *
 * Returns 400 with validation errors if any rule fails.
 *
 * @type {Array} Express middleware chain
 */
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

  /**
   * Middleware to check validation results
   * Returns 400 with detailed error array if validation fails
   */
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

/**
 * Validation rules for updating a task
 *
 * Validates PUT /api/tasks/:id request body:
 * - title: Optional, 1-200 characters if provided, XSS sanitized
 * - description: Optional, max 1000 characters if provided, XSS sanitized
 * - completed: Optional, must be boolean if provided
 *
 * Requires at least ONE field to be present (prevents empty updates).
 * Returns 400 with validation errors if any rule fails.
 *
 * @type {Array} Express middleware chain
 */
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

  /**
   * Middleware to check validation results and ensure at least one field is provided
   * Returns 400 if validation fails or if all fields are undefined (empty update)
   */
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

    // Ensure at least one field is provided for update (prevent empty updates)
    const { title, description, completed } = req.body;
    if (title === undefined && description === undefined && completed === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (title, description, or completed) must be provided for update'
      });
    }

    next();
  }
];

/**
 * Validation for task ID parameter
 *
 * Validates the :id parameter in routes like GET/PUT/DELETE /api/tasks/:id
 * - id: Must be a positive integer (>= 1)
 * - Automatically converts to integer type
 *
 * Returns 400 if ID is invalid.
 *
 * @type {Array} Express middleware chain
 */
exports.validateTaskId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer')
    .toInt(),

  /**
   * Middleware to check ID validation results
   * Returns 400 if ID parameter is invalid
   */
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
