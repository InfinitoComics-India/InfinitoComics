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
  // 1. Hero Slider Content (Main Carousel with user's uploaded images as default slides)
  heroSlider: [
    {
      id: "slide-1",
      title: "Monthly Drop Incoming",
      headline: "MONTHLY DROP INCOMING",
      highlightText: "MONTHLY DROP",
      subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
      buttonText: "Shop Now",
      buttonLink: "https://shop.infinitohq.com/",
      imageUrl: "/banners/hero_monthly_drop.png",
      displayMode: "banner_image", // 'banner_image' | 'custom_overlay'
      alignment: "right",
      variant: "light",
      isActive: true,
    },
    {
      id: "slide-2",
      title: "Become Infinito",
      headline: "BECOME ONE OF US BECOME INFINITO",
      highlightText: "ONE OF US",
      subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
      buttonText: "Shop Now",
      buttonLink: "https://shop.infinitohq.com/",
      imageUrl: "/banners/hero_become_infinito.png",
      displayMode: "banner_image", // 'banner_image' | 'custom_overlay'
      alignment: "left",
      variant: "dark",
      isActive: true,
    },
  ],

  // 2. Homepage Promo Banners (Multiple allowed!)
  promoBanners: [
    {
      id: "promo-1",
      badgeText: "LIMITED EDITION DROP",
      discountCode: "CRIMSON35",
      headline: "35% off",
      subtitle: "on The Crimson Bloodline",
      buttonText: "Buy Now",
      buttonLink: "https://shop.infinitohq.com/",
      bgImageUrl: "/products/crimson_tshirt.jpg",
      bgColor: "#800000",
      textColor: "#ffffff",
      isActive: true,
    },
    {
      id: "promo-2",
      badgeText: "GRAPHIC NOVEL SPECIAL",
      discountCode: "INFINITOVIP",
      headline: "FLAT 25% OFF",
      subtitle: "on ALL COMIC BOOKS & PRINTS",
      buttonText: "Explore Now",
      buttonLink: "https://shop.infinitohq.com/",
      bgImageUrl: "",
      bgColor: "#111827",
      textColor: "#ffffff",
      isActive: true,
    },
  ],

  // 3. Top Announcement / Promo Bar Content (Multiple allowed!)
  promoBars: [
    {
      id: "bar-1",
      text: "⚡ SPECIAL LAUNCH OFFER: GET 35% OFF ON SELECTED MERCH WITH CODE CRIMSON35 | FREE SHIPPING ON ORDERS ABOVE ₹999",
      link: "https://shop.infinitohq.com/",
      bgColor: "#DD1215",
      textColor: "#ffffff",
      isActive: true,
    },
    {
      id: "bar-2",
      text: "🔥 NEW DROP ALERT: THE CRIMSON BLOODLINE IS NOW LIVE — ONLY 500 PIECES WORLDWIDE",
      link: "https://shop.infinitohq.com/",
      bgColor: "#0f172a",
      textColor: "#ffffff",
      isActive: true,
    },
  ],

  // Legacy single references for backward compatibility
  promoBanner: {
    headline: "35% off",
    subtitle: "on The Crimson Bloodline",
    buttonText: "Buy Now",
    buttonLink: "https://shop.infinitohq.com/",
    badgeText: "LIMITED EDITION DROP",
    discountCode: "CRIMSON35",
    bgImageUrl: "/products/crimson_tshirt.jpg",
    bgColor: "#800000",
    textColor: "#ffffff",
    isActive: true,
  },
  promoBar: {
    text: "⚡ SPECIAL LAUNCH OFFER: GET 35% OFF ON SELECTED MERCH WITH CODE CRIMSON35 | FREE SHIPPING ON ORDERS ABOVE ₹999",
    bgColor: "#DD1215",
    textColor: "#ffffff",
    link: "https://shop.infinitohq.com/",
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

const broadcastBanners = (data) => {
  try {
    const channel = new BroadcastChannel('infinito_banners_channel');
    channel.postMessage({ type: 'banners_updated', data });
    channel.close();
  } catch {}
};

export const getMarketingBanners = async () => {
  try {
    const raw = localStorage.getItem(BANNERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate or merge missing multi-item collections
      const merged = {
        ...DEFAULT_BANNERS_CONFIG,
        ...parsed,
        heroSlider: Array.isArray(parsed.heroSlider) && parsed.heroSlider.length > 0 && parsed.heroSlider[0].imageUrl
          ? parsed.heroSlider
          : DEFAULT_BANNERS_CONFIG.heroSlider,
        promoBanners: Array.isArray(parsed.promoBanners) && parsed.promoBanners.length > 0
          ? parsed.promoBanners
          : DEFAULT_BANNERS_CONFIG.promoBanners,
        promoBars: Array.isArray(parsed.promoBars) && parsed.promoBars.length > 0
          ? parsed.promoBars
          : DEFAULT_BANNERS_CONFIG.promoBars,
      };
      return merged;
    }
    localStorage.setItem(BANNERS_KEY, JSON.stringify(DEFAULT_BANNERS_CONFIG));
    broadcastBanners(DEFAULT_BANNERS_CONFIG);
    return DEFAULT_BANNERS_CONFIG;
  } catch (e) {
    console.error('Failed to get banners config:', e);
    return DEFAULT_BANNERS_CONFIG;
  }
};

export const updateHeroSlider = async (slides) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    heroSlider: slides,
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  broadcastBanners(updated);
  return updated;
};

export const updatePromoBanners = async (banners) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    promoBanners: banners,
    promoBanner: banners[0] || current.promoBanner,
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  broadcastBanners(updated);
  return updated;
};

export const updatePromoBars = async (bars) => {
  const current = await getMarketingBanners();
  const updated = {
    ...current,
    promoBars: bars,
    promoBar: bars[0] || current.promoBar,
  };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  broadcastBanners(updated);
  return updated;
};

export const updatePromoBanner = async (bannerData) => {
  const current = await getMarketingBanners();
  const list = Array.isArray(current.promoBanners) && current.promoBanners.length > 0 ? [...current.promoBanners] : [{ ...DEFAULT_BANNERS_CONFIG.promoBanners[0] }];
  list[0] = { ...list[0], ...bannerData };
  return updatePromoBanners(list);
};

export const updatePromoBar = async (barData) => {
  const current = await getMarketingBanners();
  const list = Array.isArray(current.promoBars) && current.promoBars.length > 0 ? [...current.promoBars] : [{ ...DEFAULT_BANNERS_CONFIG.promoBars[0] }];
  list[0] = { ...list[0], ...barData };
  return updatePromoBars(list);
};
