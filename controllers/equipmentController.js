const Equipment = require('../models/Equipment');
const { cloudinary } = require('../config/cloudinary');

// Get all equipment with filtering
const getEquipment = async (req, res) => {
  try {
    const { category, lga, minPrice, maxPrice, condition, page = 1, limit = 10 } = req.query;
    let filter = { isAvailable: true };

    if (category) filter.category = category;
    if (lga) filter['location.lga'] = new RegExp(lga, 'i');
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

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
};

// Get single equipment
const getSingleEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('owner', 'name email phone');
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my equipment (equipment owned by the current user)
const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new equipment listing
const createEquipment = async (req, res) => {
  try {
    // Process uploaded images from Cloudinary
    const imageData = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];
    
    const equipment = new Equipment({
      ...req.body,
      owner: req.user.id,
      images: imageData
    });

    const savedEquipment = await equipment.save();
    await savedEquipment.populate('owner', 'name email phone');
    
    res.status(201).json(savedEquipment);
  } catch (error) {
    // Delete uploaded images from Cloudinary if there was an error
    if (req.files && req.files.length > 0) {
      const publicIds = req.files.map(file => file.filename);
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (cloudinaryError) {
        console.error('Error cleaning up Cloudinary images:', cloudinaryError);
      }
    }
    res.status(400).json({ message: error.message });
  }
};

// Update equipment listing
const updateEquipment = async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if user is the owner or admin
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Process new uploaded images
    let imageData = equipment.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
      imageData = [...equipment.images, ...newImages];
    }

    equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: imageData },
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');
    
    res.json(equipment);
  } catch (error) {
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      const publicIds = req.files.map(file => file.filename);
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (cloudinaryError) {
        console.error('Error cleaning up Cloudinary images:', cloudinaryError);
      }
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete equipment listing
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if user is the owner or admin
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete associated images from Cloudinary
    if (equipment.images && equipment.images.length > 0) {
      const publicIds = equipment.images.map(image => image.public_id);
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary images:', cloudinaryError);
      }
    }

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific image from equipment
const deleteEquipmentImage = async (req, res) => {
  try {
    const { equipmentId, imageId } = req.params;
    
    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if user is the owner or admin
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the image to delete
    const imageToDelete = equipment.images.id(imageId);
    if (!imageToDelete) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the image from Cloudinary
    try {
      await cloudinary.uploader.destroy(imageToDelete.public_id);
    } catch (cloudinaryError) {
      console.error('Error deleting image from Cloudinary:', cloudinaryError);
    }

    // Remove the image from the array
    equipment.images.pull(imageId);
    await equipment.save();

    res.json({ message: 'Image deleted successfully', equipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make sure ALL functions are exported correctly
module.exports = {
  getEquipment,
  getSingleEquipment,
  getMyEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  deleteEquipmentImage
};