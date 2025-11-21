const express = require('express');
const router = express.Router();

/**
 * GET /api/hello
 * Returns a greeting message with current timestamp
 *
 * @route GET /api/hello
 * @returns {Object} 200 - Greeting message and timestamp
 * @returns {Object} 500 - Internal server error
 */
router.get('/', (req, res) => {
  try {
    res.json({
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
