const express = require('express');
const User = require('../models/user.js');
const Land = require('../models/Land.js');
const Equipment = require('../models/Equipment.js');
const { auth, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(auth, authorizeAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const landCount = await Land.countDocuments();
    const equipmentCount = await Equipment.countDocuments();
    const ownerCount = await User.countDocuments({ role: 'owner' });
    const leaserCount = await User.countDocuments({ role: 'leaser' });
    
    res.json({
      users: userCount,
      lands: landCount,
      equipment: equipmentCount,
      owners: ownerCount,
      leasers: leaserCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users with filtering
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (role) filter.role = role;
    
    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all lands with admin filters
router.get('/lands', async (req, res) => {
  try {
    const { isAvailable, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    
    const lands = await Land.find(filter)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Land.countDocuments(filter);
    
    res.json({
      lands,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all equipment with admin filters
router.get('/equipment', async (req, res) => {
  try {
    const { isAvailable, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    
    const equipment = await Equipment.find(filter)
      .populate('owner', 'name email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Equipment.countDocuments(filter);
    
    res.json({
      equipment,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;