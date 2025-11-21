/**
 * Task Manager API - Server Entry Point
 *
 * This file bootstraps and starts the Express application server.
 * It loads environment configuration, imports the configured Express app,
 * and starts the HTTP server on the specified port.
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Application environment (development/production)
 *
 * @module server
 */

// Load environment variables from .env file
require('dotenv').config();
const app = require('./app');

// Configure server port from environment or use default
const PORT = process.env.PORT || 3000;

// Start the HTTP server and log startup information
app.listen(PORT, () => {
  console.log(`✓ Task Manager API is running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API endpoint: http://localhost:${PORT}/api/tasks`);
});
