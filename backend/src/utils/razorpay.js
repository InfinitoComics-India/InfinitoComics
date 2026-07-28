import config from "../config/server-config.js";

// Razorpay is disabled until credentials are configured
// Replace RAZORPAY_KEY_ID and RAZORPAY_SECRET_KEY in .env to enable

let instance = null;

if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_ID !== 'your-razorpay-key-id' &&
    config.RAZORPAY_SECRET_KEY && config.RAZORPAY_SECRET_KEY !== 'your-razorpay-secret-key') {
  try {
    const Razorpay = (await import('razorpay')).default;
    instance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_SECRET_KEY
    });
    console.log('Razorpay initialized');
  } catch (err) {
    console.warn('Razorpay initialization failed:', err.message);
  }
} else {
  console.warn('Razorpay not configured - payment features disabled');
}

export default instance;
