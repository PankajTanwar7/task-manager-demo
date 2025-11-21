const express = require('express');
const router = express.Router();

/**
 * GET /api/hello
 * Returns a greeting message with current timestamp
 *
 * This endpoint is primarily used for testing the automation
 * workflow and verifying API connectivity.
 *
 * @route GET /api/hello
 * @returns {Object} 200 - Greeting message and timestamp
 * @returns {Object} 500 - Internal server error
 * @example
 * // Response example:
 * {
 *   "success": true,
 *   "message": "Hello, World!",
 *   "timestamp": "2025-11-22T02:30:00.000Z"
 * }
 */
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Hello, World!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate greeting'
    });
  }
});

module.exports = router;
