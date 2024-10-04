// uploadFile.js
import cloudinary from '../config/cloudinaryConfig.js';

/**
 * Uploads a file to Cloudinary and returns the URL of the uploaded file.
 * 
 * @param {string} filePath - The local path of the file to upload.
 * @param {Object} options - Additional Cloudinary options like folder, public_id, etc.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'default-folder',
      public_id: options.publicId || undefined,
      resource_type: 'auto', // Automatically detect the file type (image, video, etc.)
    });

    console.log('File uploaded successfully:', result);
    return result.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error('File upload failed');
  }
};
