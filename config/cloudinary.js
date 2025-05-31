// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.log('No file path provided');
      return null;
    }
    
    // Verify file exists before uploading
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist at path:', filePath);
      return null;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'testimonials'
    });
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Clean up file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};
