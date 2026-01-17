const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
} = require('../controllers/user_controller');

// Create user endpoint (without /users prefix)
router.post('/add', createUser);

// User routes (with /users prefix)
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById);

module.exports = router;
