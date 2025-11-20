const express = require('express');
const router = express.Router();

// Server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * GET /health
 * Health check endpoint for monitoring and deployment verification
 *
 * @returns {Object} Health status information
 * @returns {string} status - Server status (always "ok")
 * @returns {number} uptime - Server uptime in seconds
 * @returns {string} timestamp - Current ISO timestamp
 */
router.get('/', (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
