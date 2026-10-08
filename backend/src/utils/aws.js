import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import path from 'path';
import config from '../config/server-config.js';

/**
 * Dynamically extract and normalize Cloudinary credentials
 */
export const getCloudinaryConfig = () => {
  const url = (process.env.CLOUDINARY_URL || config?.CLOUDINARY_URL || '').trim();

  const cloud_name = (
    process.env.CLOUDINARY_CLOUD_NAME ||
    config?.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUD_NAME ||
    process.env.CLOUDINARY_NAME ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  const api_key = (
    process.env.CLOUDINARY_API_KEY ||
    config?.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_KEY ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  const api_secret = (
    process.env.CLOUDINARY_API_SECRET ||
    config?.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  const isConfigured = Boolean(url || (cloud_name && api_key && api_secret));

  return {
    isConfigured,
    url,
    cloud_name,
    api_key,
    api_secret,
  };
};

/**
 * Configure Cloudinary instance before upload
 */
export const initCloudinary = () => {
  const cfg = getCloudinaryConfig();
  if (!cfg.isConfigured) return false;

  if (cfg.url) {
    cloudinary.config({
      cloudinary_url: cfg.url,
      secure: true,
    });
  } else {
    cloudinary.config({
      cloud_name: cfg.cloud_name,
      api_key: cfg.api_key,
      api_secret: cfg.api_secret,
      secure: true,
    });
  }
  return true;
};

/**
 * Health check / status for Cloudinary
 */
export const getCloudinaryStatus = async () => {
  const cfg = getCloudinaryConfig();
  if (!cfg.isConfigured) {
    return {
      configured: false,
      status: 'missing_keys',
      cloudName: null,
      message: 'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET or CLOUDINARY_URL) are not set.',
    };
  }

  try {
    initCloudinary();
    const ping = await cloudinary.api.ping();
    return {
      configured: true,
      status: ping?.status || 'ok',
      cloudName: cfg.cloud_name || 'configured via URL',
      message: 'Cloudinary is connected and active for permanent image hosting.',
    };
  } catch (err) {
    return {
      configured: true,
      status: 'connection_error',
      cloudName: cfg.cloud_name || null,
      message: `Cloudinary configured but ping failed: ${err.message}`,
    };
  }
};

/**
 * Upload buffer to Cloudinary (or resilient fallback)
 */
export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const sanitizedName = (fileName || 'image.png').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = path.extname(fileName || '').toLowerCase() || (contentType === 'image/svg+xml' ? '.svg' : '.png');
  const isSvg = ext === '.svg' || contentType === 'image/svg+xml' || (contentType && contentType.includes('svg'));
  const mimeType = contentType || (isSvg ? 'image/svg+xml' : 'image/png');
  const publicId = `${Date.now()}-${sanitizedName}`;

  // 1. Try Cloudinary if configured
  const hasCloudinary = initCloudinary();
  if (hasCloudinary) {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: 'infinito-comics/shop',
          public_id: publicId,
          resource_type: isSvg ? 'auto' : 'image',
          overwrite: true,
          secure: true,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve({
              Location: result.secure_url || result.url,
              Key: result.public_id || publicId,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );

        const readable = new Readable();
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
      });

      console.log(`[Cloudinary] Successfully uploaded ${fileName} -> ${uploadResult.Location}`);
      return uploadResult;
    } catch (cloudErr) {
      console.error('[Cloudinary Upload Error]', cloudErr.message || cloudErr);
    }
  } else {
    console.warn('[uploadToS3] Cloudinary not configured in environment. Using Data URI fallback.');
  }

  // 2. Safe Fallback: Base64 Data URI
  // Data URIs are stored directly in MongoDB, so they NEVER get deleted by Render ephemeral disk resets!
  const base64Data = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  return {
    Location: dataUri,
    Key: publicId,
  };
};
