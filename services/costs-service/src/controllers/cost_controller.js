const Cost = require('../models/Cost');
const Report = require('../models/Report');
const logger = require('../utils/logger');
const axios = require('axios');
const crypto = require('crypto');

const usersServiceUrl = process.env.USERS_SERVICE_URL || 'http://localhost:3001';
const baseCategories = ['food', 'education', 'health', 'housing', 'sports'];

// Get all costs
const getAllCosts = async (req, res, next) => {
  try {
    const { userid, category } = req.query;
    const query = {};

    if (userid) {
      const userId = parseInt(userid, 10);
      if (isNaN(userId)) {
        return res.status(400).json({
          id: crypto.randomUUID(),
          message: 'Invalid userid. Must be a number',
        });
      }
      query.userid = userId;
    }
    if (category) {
      query.category = category;
    }

    const costs = await Cost.find(query).sort({ createdAt: -1 });

    // Get user information from users-service
    if (costs.length > 0) {
      const userIds = [...new Set(costs.map(cost => cost.userid))];

      try {
        const userPromises = userIds.map(userId =>
          axios.get(`${usersServiceUrl}/api/users/${userId}`).catch(() => null)
        );
        const userResponses = await Promise.all(userPromises);

        const userMap = {};
        userResponses.forEach((response, index) => {
          if (response && response.data) {
            const user = response.data;
            userMap[userIds[index]] = {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              full_name: `${user.first_name} ${user.last_name}`,
            };
          }
        });

        const costsWithUsers = costs.map(cost => {
          const costObj = cost.toObject();
          const user = userMap[cost.userid];
          if (user) {
            costObj.user = user;
          }
          return costObj;
        });

        logger.info(`Retrieved ${costs.length} costs`);
        return res.status(200).json(costsWithUsers);
      } catch (error) {
        logger.warn(`Could not fetch users from users-service: ${error.message}`);
        // Continue without user info if users-service is unavailable
      }
    }

    logger.info(`Retrieved ${costs.length} costs`);
    res.status(200).json(costs);
  } catch (error) {
    logger.error(`Error getting costs: ${error.message}`);
    next(error);
  }
};

// Create new cost
const createCost = async (req, res, next) => {
  try {
    // Validate and convert userid to number
    const userId = parseInt(req.body.userid, 10);
    if (isNaN(userId)) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid userid. Must be a number',
      });
    }

    // Verify user exists in users-service
    try {
      await axios.get(`${usersServiceUrl}/api/users/${userId}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          id: crypto.randomUUID(),
          message: 'User not found',
        });
      }
      logger.warn(`Could not verify user in users-service: ${error.message}`);
    }

    // Prepare cost data
    const costData = { ...req.body, userid: userId };

    // Handle optional createdAt field
    if (req.body.createdAt) {
      const createdAtDate = new Date(req.body.createdAt);
      if (isNaN(createdAtDate.getTime())) {
        return res.status(400).json({
          id: crypto.randomUUID(),
          message: 'Invalid createdAt. Must be a valid date',
        });
      }

      // Block dates in the past
      const now = new Date();
      if (createdAtDate < now) {
        return res.status(400).json({
          id: crypto.randomUUID(),
          message: 'Cannot create cost with a date in the past',
        });
      }

      costData.createdAt = createdAtDate;
    }

    const cost = await Cost.create(costData);

    logger.info(`Created new cost: ${cost.id}`);
    res.status(201).json(cost);
  } catch (error) {
    logger.error(`Error creating cost: ${error.message}`);
    next(error);
  }
};

// Get total costs for a user
const getTotalCostsByUserId = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid user ID. Must be a number',
      });
    }

    const totalCostsResult = await Cost.aggregate([
      { $match: { userid: userId } },
      { $group: { _id: null, total: { $sum: '$sum' } } }
    ]);

    const total = totalCostsResult.length > 0 ? totalCostsResult[0].total : 0;

    logger.info(`Retrieved total costs for user ${userId}: ${total}`);
    res.status(200).json({
      total: total,
    });
  } catch (error) {
    logger.error(`Error getting total costs: ${error.message}`);
    next(error);
  }
};

// Get monthly report for a user (Computed Design Pattern)
const getMonthlyReport = async (req, res, next) => {
  try {
    const { id, year, month } = req.query;

    // Validate parameters
    const userId = parseInt(id, 10);
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid id. Must be a positive number',
      });
    }

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid year. Must be a valid year between 1900 and 2100',
      });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid month. Must be between 1 and 12',
      });
    }

    // Check if the month/year is in the past
    const now = new Date();
    const reportDate = new Date(yearNum, monthNum - 1, 1); // First day of the month
    const isPastMonth = reportDate < new Date(now.getFullYear(), now.getMonth(), 1);

    // If it's a past month, check for cached report
    if (isPastMonth) {
      const cachedReport = await Report.findOne({ userid: userId, year: yearNum, month: monthNum });
      if (cachedReport) {
        logger.info(`Retrieved cached monthly report for user ${userId}, ${yearNum}-${monthNum}`);
        return res.status(200).json({
          userid: cachedReport.userid,
          year: cachedReport.year,
          month: cachedReport.month,
          costs: cachedReport.costs,
        });
      }
    }

    // Generate the report
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of the month (monthNum, 0 gives last day of monthNum - 1)

    const costs = await Cost.find({
      userid: userId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: 1 });

    // Get all unique categories
    const allCategories = [...new Set([...baseCategories, ...costs.map(cost => cost.category)])];

    // Group costs by category
    const costsByCategory = {};
    allCategories.forEach(category => {
      costsByCategory[category] = [];
    });

    costs.forEach(cost => {
      const day = cost.createdAt.getDate();
      costsByCategory[cost.category].push({
        sum: cost.sum,
        description: cost.description,
        day: day,
      });
    });

    // Format costs array according to the required structure
    const costsArray = allCategories.map(category => {
      const categoryObj = {};
      categoryObj[category] = costsByCategory[category];
      return categoryObj;
    });

    const report = {
      userid: userId,
      year: yearNum,
      month: monthNum,
      costs: costsArray,
    };

    // Cache the report if it's a past month
    if (isPastMonth) {
      try {
        await Report.findOneAndUpdate(
          { userid: userId, year: yearNum, month: monthNum },
          { userid: userId, year: yearNum, month: monthNum, costs: costsArray },
          { upsert: true, new: true }
        );
        logger.info(`Cached monthly report for user ${userId}, ${yearNum}-${monthNum}`);
      } catch (error) {
        logger.warn(`Failed to cache report: ${error.message}`);
        // Continue even if caching fails
      }
    }

    logger.info(`Generated monthly report for user ${userId}, ${yearNum}-${monthNum}`);
    res.status(200).json(report);
  } catch (error) {
    logger.error(`Error getting monthly report: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllCosts,
  createCost,
  getTotalCostsByUserId,
  getMonthlyReport,
};
