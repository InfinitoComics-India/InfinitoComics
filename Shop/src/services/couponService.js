// Coupon & Discount Service for Storefront Checkout

export const DEFAULT_COUPONS = [
  {
    code: 'INFINT10',
    title: '10% OFF Storewide',
    description: 'Get 10% instant discount on all merchandise & comics.',
    type: 'Percentage',
    value: 10,
    minPurchase: 0,
    badge: 'POPULAR',
  },
  {
    code: 'WELCOME150',
    title: 'Flat ₹150 OFF',
    description: 'Flat ₹150 discount on your order above ₹799.',
    type: 'Fixed',
    value: 150,
    minPurchase: 799,
    badge: 'FIRST ORDER',
  },
  {
    code: 'CRIMSON35',
    title: '35% Collector Drop',
    description: 'Huge 35% discount on collector drops above ₹499.',
    type: 'Percentage',
    value: 35,
    minPurchase: 499,
    badge: 'SPECIAL DROP',
  },
  {
    code: 'FREESHIP',
    title: 'Free Express Shipping',
    description: 'Flat ₹50 shipping fee waiver on orders above ₹999.',
    type: 'Fixed',
    value: 50,
    minPurchase: 999,
    badge: 'FREE DELIVERY',
  },
  {
    code: 'SUPERHERO20',
    title: '20% Fan Club Special',
    description: '20% off on premium apparel and figurines above ₹1,199.',
    type: 'Percentage',
    value: 20,
    minPurchase: 1199,
    badge: 'MEMBERS',
  },
];

/**
 * Retrieve all active available coupons (defaults + admin created)
 */
export const getAvailableCoupons = () => {
  const couponsMap = new Map();

  // 1. Load default platform coupons
  DEFAULT_COUPONS.forEach((c) => couponsMap.set(c.code.toUpperCase(), c));

  // 2. Load any coupons created by Admin in Admin Marketing dashboard
  try {
    const adminRaw = localStorage.getItem('infinito_discount_codes');
    if (adminRaw) {
      const adminDiscounts = JSON.parse(adminRaw);
      if (Array.isArray(adminDiscounts)) {
        adminDiscounts.forEach((ad) => {
          if (ad.code && ad.status === 'Active') {
            const codeUpper = ad.code.toUpperCase().trim();
            const isPct = String(ad.type).toLowerCase().includes('percent');
            couponsMap.set(codeUpper, {
              code: codeUpper,
              title: `${ad.value}${isPct ? '%' : '₹'} OFF`,
              description: ad.appliesToDetail || `Discount for ${codeUpper}`,
              type: isPct ? 'Percentage' : 'Fixed',
              value: Number(ad.value) || 10,
              minPurchase: Number(ad.minPurchase) || 0,
              badge: 'ADMIN OFFER',
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Could not read admin discounts from storage:', e);
  }

  return Array.from(couponsMap.values());
};

/**
 * Validate and calculate discount for a coupon code given subtotal
 */
export const validateCoupon = (couponCode, subtotal) => {
  const cleanCode = String(couponCode || '').toUpperCase().trim();
  if (!cleanCode) {
    return { valid: false, message: 'Please enter a coupon code' };
  }

  const allCoupons = getAvailableCoupons();
  const found = allCoupons.find((c) => c.code === cleanCode);

  if (!found) {
    return { valid: false, message: `Coupon code "${cleanCode}" is invalid or expired` };
  }

  const numSubtotal = Number(subtotal) || 0;
  if (found.minPurchase && numSubtotal < found.minPurchase) {
    return {
      valid: false,
      message: `Minimum order of ₹${found.minPurchase.toFixed(2)} required for ${cleanCode} (Cart is ₹${numSubtotal.toFixed(2)})`,
      shortfall: found.minPurchase - numSubtotal,
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (found.type === 'Percentage') {
    discountAmount = (numSubtotal * found.value) / 100;
  } else {
    discountAmount = Math.min(found.value, numSubtotal);
  }

  discountAmount = Number(discountAmount.toFixed(2));

  return {
    valid: true,
    coupon: found,
    discountAmount,
    message: `Coupon "${cleanCode}" applied! You saved ₹${discountAmount.toFixed(2)}`,
  };
};
