const logger = require("../utils/logger");

// Fixed array of developers
const developers = [
  {
    first_name: 'Shahaf',
    last_name: 'Levi',
  },
  {
    first_name: 'Eylon',
    last_name: 'Edri',
  },
];

// Get developers from fixed array
const getDevelopers = async (req, res, next) => {
  try {
    logger.info(`Retrieved ${developers.length} developers`);
    res.status(200).json(developers);
  } catch (error) {
    logger.error(`Error getting developers: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getDevelopers,
};
