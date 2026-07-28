// File upload using Hostinger FTP via HTTP multipart
// Files are uploaded to Hostinger web hosting public folder
import config from '../config/server-config.js';
import https from 'https';
import http from 'http';
import { Readable } from 'stream';

export const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  const key = `${Date.now()}-${fileName}`;

  // If Hostinger FTP credentials are configured, upload via FTP
  // Otherwise store file locally (fallback for dev)
  if (config.HOSTINGER_UPLOAD_URL) {
    try {
      const url = new URL(config.HOSTINGER_UPLOAD_URL);
      const fileUrl = `${config.HOSTINGER_BASE_URL}/${key}`;

      const boundary = '----FormBoundary' + Date.now().toString(16);
      const header = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${key}"\r\nContent-Type: ${contentType}\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body = Buffer.concat([header, fileBuffer, footer]);

      await new Promise((resolve, reject) => {
        const req = (url.protocol === 'https:' ? https : http).request({
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
            'Authorization': `Bearer ${config.HOSTINGER_API_KEY || ''}`
          }
        }, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve();
          else reject(new Error(`Upload failed: ${res.statusCode}`));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
      });

      return { Location: fileUrl, Key: key };
    } catch (err) {
      console.error('Hostinger upload failed:', err.message);
      throw err;
    }
  }

  // Fallback: return a placeholder URL (for dev without storage configured)
  console.warn('No storage configured. File not saved:', key);
  return {
    Location: `https://placehold.co/400x400?text=${encodeURIComponent(fileName)}`,
    Key: key
  };
};
