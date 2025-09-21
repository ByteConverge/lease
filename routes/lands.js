const express = require('express');
const { 
  getLands, 
  getLand, 
  getMyLands, 
  createLand, 
  updateLand, 
  deleteLand,
  deleteLandImage
} = require('../controllers/landController');
const { auth, authorizeOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getLands);
router.get('/:id', getLand);

// Protected routes - auth required
router.get('/user/my-lands', auth, getMyLands);
router.post('/', auth, authorizeOwner, upload, createLand);
router.put('/:id', auth, authorizeOwner, upload, updateLand);
router.delete('/:id', auth, authorizeOwner, deleteLand);
router.delete('/:landId/images/:imageId', auth, authorizeOwner, deleteLandImage);

module.exports = router;