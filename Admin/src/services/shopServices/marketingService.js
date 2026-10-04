// Service for managing Discount Codes, Banners & Hero Slider promotions
const DISCOUNTS_KEY = 'infinito_discount_codes';
const BANNERS_KEY = 'infinito_shop_banners';

// Default Discount Codes matching requirements
const DEFAULT_DISCOUNT_CODES = [
  {
    id: 'disc-1',
    code: 'INFINT10',
    type: 'Percentage', // 'Percentage' | 'Fixed amount' | 'Free shipping'
    value: 10,
    appliesTo: 'All products', // 'All products' | 'Specific products' | 'Specific collections'
    appliesToDetail: 'All Store Merchandise',
    minPurchase: 0,
    usageLimitTotal: 500,
    usageCount: 142,
    onePerCustomer: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0],
    status: 'Active', // 'Active' | 'Scheduled' | 'Expired' | 'Disabled'
  },
  {
    id: 'disc-2',
    code: 'CRIMSON35',
    type: 'Percentage',
    value: 35,
    appliesTo: 'Specific collections',
    appliesToDetail: 'The Crimson Bloodline Collection',
    minPurchase: 499,
    usageLimitTotal: 200,
    usageCount: 89,
    onePerCustomer: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0],
    status: 'Active',
  },
  {
    id: 'disc-3',
    code: 'FREESHIP',
    type: 'Free shipping',
    value: 50,
    appliesTo: 'All products',
    appliesToDetail: 'Free Express Shipping Across India',
    minPurchase: 999,
    usageLimitTotal: 1000,
    usageCount: 231,
    onePerCustomer: false,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0],
    endDate: '', // Never expires
    status: 'Active',
  },
  {
    id: 'disc-4',
    code: 'WELCOME150',
    type: 'Fixed amount',
    value: 150,
    appliesTo: 'All products',
    appliesToDetail: 'First Order Special Discount',
    minPurchase: 799,
    usageLimitTotal: 300,
    usageCount: 178,
    onePerCustomer: true,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
  },
  {
    id: 'disc-5',
    code: 'FESTIVE50',
    type: 'Percentage',
    value: 50,
    appliesTo: 'Specific products',
    appliesToDetail: 'Selected Collector Graphic Novels',
    minPurchase: 1499,
    usageLimitTotal: 100,
    usageCount: 0,
    onePerCustomer: true,
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
    status: 'Scheduled',
  },
];

// Default Shop Banners & Promotions configuration
const DEFAULT_BANNERS_CONFIG = {
  // 4.2 Homepage Promo Banner (like the 35% off on The Crimson Bloodline)
  promoBanner: {
    headline: '35% off',
    subtitle: 'on The Crimson Bloodline',
    buttonText: 'Buy Now',
    buttonLink: '/shop/catalog',
    badgeText: 'LIMITED EDITION DROP',
    discountCode: 'CRIMSON35',
    bgImageUrl: '', // Fallback to slide4.svg in frontend
    bgColor: '#111827',
    textColor: '#ffffff',
    isActive: true,
  },
  // 4.2 Hero Slider Content
  heroSlider: [
    {
      id: 1,
      headline: 'INFINITO PRIME COLLECTIBLES',
      subheading: 'Where Imagination Breaks Boundaries — Officially Licensed',
      buttonText: 'Explore Universe',
      buttonLink: '/shop/catalog',
      variant: 'dark', // 'dark' | 'light'
      hideText: false,
      imageUrl: '',
      isActive: true,
    },
    {
      id: 2,
      headline: 'PREMIUM APPAREL & GRAPHIC NOVELS',
      subheading: 'Heavyweight Cotton Tees, Oversized Hoodies & Foil-Embossed Comic Prints',
      buttonText: 'Shop New Arrivals',
      buttonLink: '/shop/catalog',
      variant: 'light',
      hideText: false,
      imageUrl: '',
      isActive: true,
    },
  ],
  // 4.2 Top Announcement / Promo Bar Content
  promoBar: {
    text: '⚡ SPECIAL LAUNCH OFFER: GET 35% OFF ON SELECTED MERCH WITH CODE CRIMSON35 | FREE SHIPPING ON ORDERS ABOVE ₹999',
    bgColor: '#DD1215',
    textColor: '#ffffff',
    link: '/shop/catalog',
    isActive: true,
  },
};

// ── DISCOUNT CODES API ─────────────────────────────────────────

export const getAllDiscountCodes = async () => {
  try {
    const raw = localStorage.getItem(DISCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(DEFAULT_DISCOUNT_CODES));
    return DEFAULT_DISCOUNT_CODES;
  } catch (e) {
    console.error('Failed to get discount codes:', e);
    return DEFAULT_DISCOUNT_CODES;
  }
};

export const createDiscountCode = async (data) => {
  const all = await getAllDiscountCodes();
  const newDiscount = {
    ...data,
    id: `disc-${Date.now()}`,
    code: (data.code || '').toUpperCase().trim(),
    usageCount: 0,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
  };

  const updated = [newDiscount, ...all];
  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(updated));
  return newDiscount;
};

export const updateDiscountCode = async (id, updates) => {
  const all = await getAllDiscountCodes();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) throw new Error('Discount code not found');

  all[index] = {
    ...all[index],
    ...updates,
    code: (updates.code || all[index].code).toUpperCase().trim(),
  };

  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(all));
  return all[index];
};

export const deleteDiscountCode = async (id) => {
  const all = await getAllDiscountCodes();
  const filtered = all.filter((d) => d.id !== id);
  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(filtered));
  return true;
};

export const toggleDiscountCodeStatus = async (id) => {
  const all = await getAllDiscountCodes();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) throw new Error('Discount code not found');

  const current = all[index].status;
  all[index].status = current === 'Active' ? 'Disabled' : 'Active';
  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(all));
  return all[index];
};

// ── BANNERS & PROMOTIONS API ───────────────────────────────────

export const getMarketingBanners = async () => {
  try {
    const raw = localStorage.getItem(BANNERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.promoBanner && parsed.heroSlider) return parsed;
    }
    localStorage.setItem(BANNERS_KEY, JSON.stringify(DEFAULT_BANNERS_CONFIG));
    return DEFAULT_BANNERS_CONFIG;
  } catch (e) {
    console.error('Failed to get banners config:', e);
    return DEFAULT_BANNERS_CONFIG;
  }
};

export const updatePromoBanner = async (bannerData) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    promoBanner: {
      ...current.promoBanner,
      ...bannerData,
    },
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  return updated;
};

export const updateHeroSlider = async (slides) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    heroSlider: slides,
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  return updated;
};

export const updatePromoBar = async (barData) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    promoBar: {
      ...current.promoBar,
      ...barData,
    },
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  return updated;
};
