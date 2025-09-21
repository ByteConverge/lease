const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'leaser'],
    default: 'leaser'
  },
  phone: {
    type: String,
    required: true
  },
 address: {
  street: String,
  lga: {
    type: String,
    enum: [
      'Bauchi', 'Tafawa Balewa', 'Dass', 'Torro', 'Bogoro', 'Ningi', 'Warji', 
      'Ganjuwa', 'Kirfi', 'Alkaleri', 'Darazo', 'Misau', 'Giade', 'Shira', 
      'Jamaare', 'Katagum', 'Itas/Gadau', 'Zaki', 'Dambam', 'Gamawa'
    ]
  },
  area: String
},
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if model is already defined to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;