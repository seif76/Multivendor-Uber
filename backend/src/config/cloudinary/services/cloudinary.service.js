const cloudinary = require('../cloudinary');
const fs = require('fs');

/**
 * Uploads a file to Cloudinary from local path
 * @param {string} filePath - Local path to the file (from Multer)
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = async (filePath, folder = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });

    // Delete temp file after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from Cloudinary by its public_id
 * @param {string} publicId
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
