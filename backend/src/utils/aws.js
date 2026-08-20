import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  // If Cloudinary is configured, upload there
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'infinito-comics',
          resource_type: 'image',
          public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            Location: result.secure_url,
            Key: result.public_id,
          });
        }
      );

      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  // Fallback placeholder when no storage is configured
  const key = `${Date.now()}-${fileName}`;
  console.warn('No storage configured. File not saved:', key);
  return {
    Location: `https://placehold.co/400x400?text=${encodeURIComponent(fileName)}`,
    Key: key,
  };
};
