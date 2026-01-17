const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error_handler');
const notFound = require('./middleware/not_found');
const endpointLogger = require('./middleware/endpoint_logger');

// Import routes
const userRoutes = require('./routes/user_routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging with Pino (logs all incoming requests)
app.use(pinoHttp({ 
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },
}));

// Endpoint access logging (logs when endpoints are accessed)
app.use(endpointLogger);

// Routes
app.use('/api', userRoutes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

