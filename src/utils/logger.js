/**
 * Application Logger
 *
 * Centralized logging configuration using Winston.
 * Provides structured logging with timestamps, stack traces, and environment-based transports.
 *
 * Configuration:
 * - Log Level: Controlled by LOG_LEVEL env var (default: 'info')
 *   Available levels: error, warn, info, http, verbose, debug, silly
 * - Format: JSON with timestamps and error stack traces
 *
 * Transports:
 * - Console: All environments, colorized output
 * - File (production only):
 *   - logs/error.log: Error level only
 *   - logs/combined.log: All levels
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Message');
 *   logger.error('Error occurred', { context: 'value' });
 *
 * @module utils/logger
 */

const winston = require('winston');

/**
 * Winston logger instance
 * Configured with environment-specific transports and formatting
 */
const logger = winston.createLogger({
  // Set log level from environment or default to 'info'
  level: process.env.LOG_LEVEL || 'info',

  // Base format: timestamp + error stack traces + JSON
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Include stack traces for errors
    winston.format.json()
  ),

  transports: [
    /**
     * Console transport - Used in all environments
     * Provides colorized, human-readable output for development and production console logs
     */
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          // Show stack trace if available (for errors), otherwise show message
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      )
    })
  ]
});

/**
 * Add file transports in production environment
 * Creates log files in logs/ directory for persistent logging
 */
if (process.env.NODE_ENV === 'production') {
  // Error-only log file
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );

  // Combined log file (all levels)
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

module.exports = logger;
