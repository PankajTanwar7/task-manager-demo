/**
 * Error Handler Middleware
 *
 * Centralized error handling for all Express routes and middleware.
 * This middleware must be registered last in the middleware chain to catch
 * all errors from previous middleware and route handlers.
 *
 * Features:
 * - Logs all errors with context (URL, method, status code)
 * - Returns consistent JSON error format
 * - Hides internal error details in production (security)
 * - Includes stack traces in development for debugging
 *
 * Error response format:
 * {
 *   success: false,
 *   error: "Error message",
 *   stack: "..." // Only in development
 * }
 *
 * @module middleware/errorHandler
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 *
 * @param {Error} err - Error object thrown or passed to next()
 * @param {number} [err.statusCode] - HTTP status code (defaults to 500)
 * @param {string} err.message - Error message
 * @param {string} err.stack - Stack trace
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends JSON error response
 */
const errorHandler = (err, req, res, next) => {
  // Log error with context for debugging and monitoring
  logger.error('API Error', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    url: req.url,
    method: req.method
  });

  // Use custom status code if provided, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Security: Don't expose internal error details in production
  // Generic message for 500 errors in production to prevent information leakage
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  // Send consistent error response format
  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace only in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
