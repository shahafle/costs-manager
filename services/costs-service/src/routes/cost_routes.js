const express = require('express');
const router = express.Router();
const {
  getAllCosts,
  createCost,
  getTotalCostsByUserId,
  getMonthlyReport,
} = require('../controllers/cost_controller');

// Create cost endpoint (without /costs prefix)
router.post('/add', createCost);

// Monthly report endpoint
router.get('/report', getMonthlyReport);

router.route('/costs')
  .get(getAllCosts);

router.route('/costs/total/:userId')
  .get(getTotalCostsByUserId);

module.exports = router;
