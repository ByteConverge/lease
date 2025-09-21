const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
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
  size: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  leaseDuration: {
    type: String,
    enum: ['short_term', 'long_term'],
    default: 'short_term'
  },
  amenities: [String],
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
const Land = mongoose.models.Land || mongoose.model('Land', landSchema);

module.exports = Land;