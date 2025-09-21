const express = require('express');
const { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { auth, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin only routes
router.get('/', auth, authorizeAdmin, getUsers);
router.get('/:id', auth, authorizeAdmin, getUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, authorizeAdmin, deleteUser);

module.exports = router;