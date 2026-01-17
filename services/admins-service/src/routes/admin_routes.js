const express = require('express');
const router = express.Router();
const {
  getDevelopers,
} = require('../controllers/admin_controller');

router.get('/about', getDevelopers);

module.exports = router;
