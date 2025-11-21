/**
 * Task Manager API - Express Application Configuration
 *
 * This module configures and assembles the Express application with:
 * - Security middleware (Helmet for HTTP headers)
 * - Rate limiting (100 requests per 15 minutes per IP)
 * - CORS with environment-based origin validation
 * - Body parsing with size limits to prevent DoS
 * - Task management and health check routes
 * - Centralized error handling
 *
 * Environment Variables:
 * - NODE_ENV: Controls CORS behavior (production requires ALLOWED_ORIGINS)
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins (production only)
 *
 * @module app
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');
const helloRoutes = require('./routes/hello');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

/**
 * Apply response compression
 * Compresses response bodies for all requests
 * - Reduces bandwidth usage by 60-90%
 * - Faster response times
 * - Only compresses responses >= 1KB (threshold)
 * - Supports gzip and deflate
 */
app.use(compression({
  threshold: 1024, // Only compress responses > 1KB
  level: 6 // Compression level (0-9, 6 is balanced)
}));

/**
 * Apply Helmet security middleware
 * Sets various HTTP headers to protect against common vulnerabilities:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: SAMEORIGIN
 * - X-XSS-Protection: 1; mode=block
 * - And other security-related headers
 */
app.use(helmet());

/**
 * Configure rate limiting to prevent API abuse
 * Limits each IP address to 100 requests per 15-minute window
 * Applies only to /api/* endpoints
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 100, // Higher limit for tests
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

app.use('/api/', limiter);

/**
 * Configure CORS (Cross-Origin Resource Sharing)
 * - Production: Requires ALLOWED_ORIGINS environment variable (comma-separated list)
 * - Development: Allows all origins (*)
 * - credentials: true allows cookies and authentication headers
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : (() => {
        console.error('ERROR: ALLOWED_ORIGINS is required in production but not set');
        process.exit(1);
      })())
    : '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Apply body parsing middleware
 * - JSON and URL-encoded bodies limited to 10KB to prevent DoS attacks
 * - extended: true allows rich objects and arrays in URL-encoded data
 */
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * JSON parsing error handler
 * Catches malformed JSON and payload size errors from express.json()
 * Returns 400 Bad Request instead of 500 Internal Server Error
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Malformed JSON
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      details: err.message
    });
  }

  if (err.type === 'entity.too.large') {
    // Payload too large
    return res.status(413).json({
      success: false,
      error: 'Request body too large',
      details: 'Maximum size is 10KB'
    });
  }

  // Pass other errors to next error handler
  next(err);
});

/**
 * Request logging middleware
 * Logs all requests except /health (to reduce noise)
 */
app.use(requestLogger);

/**
 * Mount route handlers
 * - /api/tasks - Task management endpoints (CRUD operations)
 * - /api/hello - Greeting endpoint for testing
 * - /health - Health check endpoint for monitoring
 */
app.use('/api/tasks', taskRoutes);
app.use('/api/hello', helloRoutes);
app.use('/health', healthRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

/**
 * Centralized error handling middleware
 * Catches all errors from routes and middleware
 * Must be the last middleware in the chain
 */
app.use(errorHandler);

module.exports = app;
