const Land = require('../models/land.js');
const { cloudinary } = require('../config/cloudinary');

// Get all lands with filtering
const getLands = async (req, res) => {
  try {
    const { lga, minPrice, maxPrice, minSize, maxSize, page = 1, limit = 10 } = req.query;
    let filter = { isAvailable: true };

    if (lga) filter['location.lga'] = new RegExp(lga, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minSize || maxSize) {
      filter.size = {};
      if (minSize) filter.size.$gte = Number(minSize);
      if (maxSize) filter.size.$lte = Number(maxSize);
    }

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
};

// Get single land
const getLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('owner', 'name email phone');
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }
    res.json(land);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my lands (lands owned by the current user)
const getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new land listing with Cloudinary images
const createLand = async (req, res) => {
  try {
    // Process uploaded images from Cloudinary
    const imageData = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];
    
    const land = new Land({
      ...req.body,
      owner: req.user.id,
      images: imageData
    });

    const savedLand = await land.save();
    await savedLand.populate('owner', 'name email phone');
    
    res.status(201).json(savedLand);
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

// Update land listing with Cloudinary images
const updateLand = async (req, res) => {
  try {
    let land = await Land.findById(req.params.id);
    
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    // Check if user is the owner or admin
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Process new uploaded images
    let imageData = land.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
      imageData = [...land.images, ...newImages];
    }

    land = await Land.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: imageData },
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');
    
    res.json(land);
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

// Delete land listing with Cloudinary cleanup
const deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    // Check if user is the owner or admin
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete associated images from Cloudinary
    if (land.images && land.images.length > 0) {
      const publicIds = land.images.map(image => image.public_id);
      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary images:', cloudinaryError);
      }
    }

    await Land.findByIdAndDelete(req.params.id);
    res.json({ message: 'Land removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific image from Cloudinary and database
const deleteLandImage = async (req, res) => {
  try {
    const { landId, imageId } = req.params;
    
    const land = await Land.findById(landId);
    
    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    // Check if user is the owner or admin
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the image to delete
    const imageToDelete = land.images.id(imageId);
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
    land.images.pull(imageId);
    await land.save();

    res.json({ message: 'Image deleted successfully', land });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Make sure ALL functions are exported correctly
module.exports = {
  getLands,
  getLand,
  getMyLands,
  createLand,
  updateLand,
  deleteLand,
  deleteLandImage
};