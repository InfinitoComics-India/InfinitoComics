import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary from environment variables if fully provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const sanitizedName = (fileName || 'image.png').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = path.extname(fileName || '').toLowerCase() || (contentType === 'image/svg+xml' ? '.svg' : '.png');
  const isSvg = ext === '.svg' || contentType === 'image/svg+xml' || (contentType && contentType.includes('svg'));
  const mimeType = contentType || (isSvg ? 'image/svg+xml' : 'image/png');
  const publicId = `${Date.now()}-${sanitizedName}`;

  // 1. Try Cloudinary if fully configured
  if (isCloudinaryConfigured) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: 'infinito-comics',
          public_id: publicId,
          resource_type: isSvg ? 'auto' : 'image',
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve({
              Location: result.secure_url || result.url,
              Key: result.public_id || publicId,
            });
          }
        );

        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      return uploadResult;
    } catch (cloudErr) {
      console.warn('[uploadToS3] Cloudinary upload failed, falling back to data URI / local storage:', cloudErr.message);
    }
  }

  // 2. Fallback: For SVGs or images under 2MB, a base64 Data URI is permanent,
  // self-contained, and never 404s or gets erased by Render ephemeral restarts.
  if (isSvg || (fileBuffer && fileBuffer.length <= 2 * 1024 * 1024)) {
    const base64Data = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;
    return {
      Location: dataUri,
      Key: publicId,
    };
  }

  // 3. Fallback: Save to local uploads folder on disk if larger than 2MB
  try {
    const uploadDir = path.resolve('uploads', 'shop');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const diskFileName = `${publicId}${ext}`;
    const filePath = path.join(uploadDir, diskFileName);
    fs.writeFileSync(filePath, fileBuffer);

    const backendBase = (process.env.BACKEND_URL || 'https://infinitocomics-68cr.onrender.com').replace(/\/$/, '');
    return {
      Location: `${backendBase}/uploads/shop/${diskFileName}`,
      Key: diskFileName,
    };
  } catch (fsErr) {
    console.warn('[uploadToS3] Local disk save failed:', fsErr.message);
  }

  // 4. Ultimate fallback placeholder (never throws 500)
  return {
    Location: `https://placehold.co/400x400?text=${encodeURIComponent(fileName || 'image')}`,
    Key: publicId,
  };
};
