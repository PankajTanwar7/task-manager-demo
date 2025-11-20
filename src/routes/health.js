const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Health check endpoint for monitoring and deployment verification
 *
 * @returns {Object} Health status information
 * @returns {boolean} success - Always true
 * @returns {string} status - Server status (always "ok")
 * @returns {string} message - Status message
 * @returns {number} uptime - Server uptime in seconds
 * @returns {string} timestamp - Current ISO timestamp
 * @returns {string} environment - Current environment (development/production)
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Task Manager API is running',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
