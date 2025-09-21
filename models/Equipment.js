const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tractor', 'plow', 'harvester', 'irrigation', 'tools', 'other']
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  price: {
    type: Number,
    required: true
  },
  rentalPeriod: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  location: {
    lga: {
      type: String,
      required: true,
      enum: [
        'Bauchi', 'Tafawa Balewa', 'Dass', 'Torro', 'Bogoro', 'Ningi', 'Warji', 
        'Ganjuwa', 'Kirfi', 'Alkaleri', 'Darazo', 'Misau', 'Giade', 'Shira', 
        'Jamaare', 'Katagum', 'Itas/Gadau', 'Zaki', 'Dambam', 'Gamawa'
      ]
    },
    area: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    url: String,
    public_id: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if model is already defined to prevent OverwriteModelError
const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);

module.exports = Equipment;