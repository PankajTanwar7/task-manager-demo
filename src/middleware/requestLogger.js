/**
 * Request Logging Middleware
 *
 * Logs all incoming HTTP requests with timestamp, method, URL, and response time.
 * Excludes /health endpoint to reduce log noise.
 *
 * Log format: [TIMESTAMP] METHOD /path - STATUS (XXXms)
 *
 * @module middleware/requestLogger
 */

const logger = require('../utils/logger');

/**
 * Request logging middleware
 * Captures request details and response time for all API requests
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requestLogger = (req, res, next) => {
  // Skip logging for health check endpoint to reduce noise
  if (req.originalUrl === '/health' || req.url === '/health') {
    return next();
  }

  // Capture start time
  const startTime = Date.now();

  // Store original res.json to intercept response
  const originalJson = res.json;

  // Override res.json to log when response is sent
  res.json = function(body) {
    // Calculate response time
    const duration = Date.now() - startTime;

    // Format timestamp
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Log request details
    logger.info(`[${timestamp}] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`);

    // Call original json method
    return originalJson.call(this, body);
  };

  next();
};

module.exports = requestLogger;
