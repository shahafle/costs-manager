const Log = require('../models/Log');
const logger = require('../utils/logger');

// Get all logs with filters
const getAllLogs = async (req, res, next) => {
  try {
    const { service, level, startDate, endDate, limit = 100 } = req.query;
    const query = {};

    if (service) {
      query.service = service;
    }
    if (level) {
      query.level = level;
    }
    if (startDate || endDate) {
      query.time = {};
      if (startDate) {
        query.time.$gte = new Date(startDate);
      }
      if (endDate) {
        query.time.$lte = new Date(endDate);
      }
    }

    const logs = await Log.find(query)
      .sort({ time: -1 })
      .limit(parseInt(limit, 10));

    logger.info(`Retrieved ${logs.length} logs`);
    res.status(200).json(logs);
  } catch (error) {
    logger.error(`Error getting logs: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllLogs,
};
