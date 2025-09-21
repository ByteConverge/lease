require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

// Test the connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
  } else {
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    console.log('Your Cloudinary is ready for image uploads! 🎉');
  }
});