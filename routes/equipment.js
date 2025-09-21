const express = require('express');
const { 
  getEquipment, 
  getSingleEquipment, 
  getMyEquipment, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment,
  deleteEquipmentImage
} = require('../controllers/equipmentController');
const { auth, authorizeOwner } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getEquipment);
router.get('/:id', getSingleEquipment);

// Protected routes
router.get('/user/my-equipment', auth, getMyEquipment);
router.post('/', auth, authorizeOwner, upload, createEquipment);
router.put('/:id', auth, authorizeOwner, upload, updateEquipment);
router.delete('/:id', auth, authorizeOwner, deleteEquipment);
router.delete('/:equipmentId/images/:imageId', auth, authorizeOwner, deleteEquipmentImage);

module.exports = router;