const express = require('express');
const router = express.Router();
const {
  getAllLogs,
} = require('../controllers/log_controller');

router.route('/')
  .get(getAllLogs);

module.exports = router;
