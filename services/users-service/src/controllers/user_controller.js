const User = require('../models/User');
const logger = require('../utils/logger');
const axios = require('axios');
const crypto = require('crypto');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    logger.info(`Retrieved ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error getting users: ${error.message}`);
    next(error);
  }
};

// Get single user by ID with total costs
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        id: crypto.randomUUID(),
        message: 'Invalid user ID. Must be a number',
      });
    }

    const user = await User.findOne({ id: userId }).select('id first_name last_name');
    
    if (!user) {
      return res.status(404).json({
        id: crypto.randomUUID(),
        message: 'User not found',
      });
    }

    // Get total costs from costs-service
    let totalCosts = 0;
    try {
      const costsServiceUrl = process.env.COSTS_SERVICE_URL || 'http://localhost:3002';
      const response = await axios.get(`${costsServiceUrl}/api/costs/total/${userId}`);
      totalCosts = response.total || 0;
    } catch (error) {
      logger.warn(`Could not fetch total costs from costs-service: ${error.message}`);
      // Continue with total = 0 if costs-service is unavailable
    }

    const response = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      total: totalCosts,
    };

    logger.info(`Retrieved user: ${user.id} with total costs: ${totalCosts}`);
    
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error getting user: ${error.message}`);
    next(error);
  }
};

// Create new user
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    logger.info(`Created new user: ${user.id}`);
    res.status(201).json(user);
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
