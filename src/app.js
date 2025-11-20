const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration with environment-based origins
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

// Body parsing middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Prevent large payload DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint with system metrics
app.get('/health', (req, res) => {
  const systemMetrics = require('./utils/systemMetrics');
  const metrics = systemMetrics.getSystemMetrics();

  res.status(200).json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    system: metrics
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
