const crypto = require('crypto');

const notFound = (req, res, next) => {
  res.status(404).json({
    id: crypto.randomUUID(),
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = notFound;
