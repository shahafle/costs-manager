const logger = require('../utils/logger');

// Middleware to log endpoint access
const endpointLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log endpoint access
  logger.info({
    endpoint: `${req.method} ${req.originalUrl || req.url}`,
    path: req.path,
    method: req.method,
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  }, 'Endpoint accessed');

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      endpoint: `${req.method} ${req.originalUrl || req.url}`,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    }, 'Endpoint response');
  });

  next();
};

module.exports = endpointLogger;
