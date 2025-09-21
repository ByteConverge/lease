const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUser 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateUser);

module.exports = router;