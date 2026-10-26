import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

// Branded category artwork bundled with the app. Admin-created categories
// with a matching slug (e.g. "tshirts", "hoodies") pick these up as a nicer
// fallback when the admin hasn't uploaded a custom image. If a category
// doesn't match, we render a red name-only card in the UI — never one of
// the static preset categories.
import tshirtsImg   from "../assets/categories/tshirts.svg";
import accessoryImg from "../assets/categories/accessory.svg";
import hoodiesImg   from "../assets/categories/hoodies.svg";
import totebagsImg  from "../assets/categories/totebags.svg";
import capsImg      from "../assets/categories/caps.png.svg";

export const fallbackCategoryImages = {
  tshirts: tshirtsImg,
  "t-shirts": tshirtsImg,
  tshirt: tshirtsImg,
  caps: capsImg,
  "caps-hats": capsImg,
  accessory: accessoryImg,
  accessories: accessoryImg,
  hoodies: hoodiesImg,
  hoodie: hoodiesImg,
  totebags: totebagsImg,
  "tote-bags": totebagsImg,
  bags: totebagsImg,
  bag: totebagsImg,
};

// Uploaded backend images arrive as "/uploads/shop/xxx.png" and need the
// backend host prepended. External URLs and data URIs are returned as-is.
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const base = BACKEND_URL?.replace(/\/$/, "") || "https://infinitocomics-68cr.onrender.com";
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
};

// Empty sync exports kept for backward-compatibility with components that
// still import these names. New code should always call the async fetchers
// below so the shop is 100% driven by admin data.
export const categories = [];
export const products = [];

// ─── CATEGORIES ───────────────────────────────────────────────────────────
export const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/shop/categories/public/all`);
    const list = Array.isArray(data?.data) ? data.data : [];

    return list.map((cat) => ({
      id: cat._id,
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image:
        resolveImageUrl(cat.image) ||
        fallbackCategoryImages[cat.slug?.toLowerCase()] ||
        fallbackCategoryImages[cat.name?.toLowerCase()] ||
        "",
      productCount: cat.productCount || 0,
      status: cat.status,
    }));
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────
// Normalize a backend product to the shape the UI already understands.
const mapBackendProduct = (p) => {
  // Extract all real variants and sizes defined by admin
  const parsedVariants = [];
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    for (const v of p.variants) {
      if (Array.isArray(v.options) && v.options.length > 0) {
        for (const opt of v.options) {
          const val = String(opt.value || opt.name || opt.size || "").trim();
          if (val) {
            parsedVariants.push({
              size: val.toUpperCase(),
              value: val,
              sku: String(opt.sku || "").trim(),
              price: Number(opt.price) || 0,
              stock: Number(opt.stock) || 0,
              name: String(v.name || "").trim(),
            });
          }
        }
      } else {
        const val = String(v.size || v.value || v.name || "").trim();
        if (val) {
          parsedVariants.push({
            size: val.toUpperCase(),
            value: val,
            sku: String(v.sku || "").trim(),
            price: Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            name: String(v.name || "").trim(),
          });
        }
      }
    }
  }

  // Real sizes only from the admin-created variants
  const parsedSizes = Array.from(new Set(parsedVariants.map((v) => v.size).filter(Boolean)));

  // Real colors from variants if present
  const detectedColors = [];
  if (Array.isArray(p.variants)) {
    for (const v of p.variants) {
      const vName = String(v.name || "").trim().toLowerCase();
      if (vName.includes("color") || vName.includes("colour") || vName.includes("shade")) {
        if (Array.isArray(v.options)) {
          v.options.forEach((opt) => {
            const val = String(opt.value || opt.name || "").trim();
            if (val && !detectedColors.includes(val)) detectedColors.push(val);
          });
        } else if (v.value || v.name) {
          const val = String(v.value || v.name).trim();
          if (val && !detectedColors.includes(val)) detectedColors.push(val);
        }
      }
    }
  }

  const rawImages = Array.isArray(p.images)
    ? p.images.map((img) => resolveImageUrl(img?.url || img)).filter(Boolean)
    : [];

  const primaryImage =
    rawImages[0] ||
    resolveImageUrl(p.image) ||
    fallbackCategoryImages[p.categorySlug?.toLowerCase()] ||
    fallbackCategoryImages[p.category?.slug?.toLowerCase()] ||
    tshirtsImg;

  // Real gallery with only unique valid URLs and NO artificial padding
  const uniqueGallery = Array.from(new Set(rawImages.filter(Boolean)));
  const gallery = uniqueGallery.length > 0 ? uniqueGallery : [primaryImage];

  const currentPrice = Number(p.salePrice || p.basePrice || 0);
  const currentMrp = p.basePrice && p.salePrice && Number(p.basePrice) > Number(p.salePrice)
    ? Number(p.basePrice)
    : Math.round(currentPrice * 1.6);

  const catSlug = p.category?.slug || p.categorySlug || (typeof p.category === "string" ? p.category : "") || "";
  const catName = p.category?.name || p.categorySlug || "";

  // Dynamic reviews data
  const backendReviews = Array.isArray(p.reviews) ? p.reviews : [];
  const avgRating = Number(p.averageRating || 0) || (backendReviews.length > 0
    ? Number((backendReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / backendReviews.length).toFixed(1))
    : 0);
  const totalCount = Number(p.totalRatingsCount || backendReviews.length || 0);

  return {
    id: p._id,
    _id: p._id,
    name: "INFINITO",
    title: p.name || "INFINITO",
    description:
      p.description ||
      p.shortDescription ||
      "Upgrade your everyday style with our premium collection, designed for a perfect blend of comfort, fashion, and versatility. Crafted from breathable cotton and tailored for an effortless modern streetwear fit.",
    price: currentPrice,
    mrp: currentMrp,
    category: catSlug,
    categoryName: catName,
    slug: p.slug,
    image: primaryImage,
    gallery,
    sizes: parsedSizes,
    colors: detectedColors.length > 0 ? detectedColors : ["Black", "Crimson Red", "White", "Navy"],
    variants: parsedVariants.length > 0 ? parsedVariants : (p.variants || []),
    sku: p.sku || (parsedVariants[0]?.sku || `INF-${(p._id || '').slice(-6).toUpperCase()}`),
    rating: avgRating,
    reviewsCount: totalCount,
    reviews: backendReviews,
    specs: p.specifications || p.specs || {
      "Sleeve Length": "Half Sleeve",
      "Fit": "Regular Fit",
      "Length": "Regular",
      "Transparency": "Opaque",
      "Material": "100% Cotton",
      "Wash Care": "Machine Wash Cold",
      "Country of Origin": "India",
      "Occasion": "Casual Streetwear",
    },
    featured: p.featured,
    stock: p.stock,
  };
};

// All published (active) products.
export const fetchProducts = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/shop/products/public/all`);
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
};

// Featured products (Top Trending row) with fallback to all products if none marked featured.
export const fetchFeaturedProducts = async (limit = 10) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/featured`,
      { params: { limit } }
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    if (list.length > 0) {
      return list.map(mapBackendProduct);
    }
  } catch (err) {
    console.error("Failed to fetch featured products, using fallback:", err);
  }
  const all = await fetchProducts();
  return all.slice(0, limit);
};

// Single product by slug (product detail page).
export const fetchProductBySlug = async (slug) => {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/slug/${clean}`
    );
    if (data?.data) return mapBackendProduct(data.data);
  } catch (err) {
    console.error("Failed to fetch product by slug endpoint, checking list:", err);
  }
  const all = await fetchProducts();
  return (
    all.find(
      (p) =>
        String(p.slug || '').toLowerCase() === clean ||
        String(p.id || '').toLowerCase() === clean ||
        String(p._id || '').toLowerCase() === clean ||
        String(p.title || '').toLowerCase() === clean
    ) || null
  );
};

// All products in a category (or all products if category is "all" or empty).
export const fetchProductsByCategory = async (categorySlug) => {
  if (!categorySlug || categorySlug === "all") {
    return await fetchProducts();
  }
  const cleanSlug = String(categorySlug).toLowerCase().trim();
  if (cleanSlug === "all") {
    return await fetchProducts();
  }
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/category/${encodeURIComponent(cleanSlug)}`
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    if (list.length > 0) {
      return list.map(mapBackendProduct);
    }
  } catch (err) {
    console.error("Failed to fetch products by category, falling back to local filter:", err);
  }
  // Fallback: search in all products
  try {
    const all = await fetchProducts();
    const normalize = (s) => String(s || "").toLowerCase().replace(/[-\s_]/g, "");
    const normalizedTarget = normalize(cleanSlug);

    return all.filter((p) => {
      const c = String(p.category || "").toLowerCase().trim();
      const cn = String(p.categoryName || "").toLowerCase().trim();
      const cid = String(p.id || p._id || p.categoryId || "").toLowerCase().trim();
      const catSlug = String(p.categorySlug || "").toLowerCase().trim();

      const normC = normalize(c);
      const normCn = normalize(cn);
      const normCatSlug = normalize(catSlug);

      return (
        c === cleanSlug ||
        cn === cleanSlug ||
        catSlug === cleanSlug ||
        cid === cleanSlug ||
        normC === normalizedTarget ||
        normCn === normalizedTarget ||
        normCatSlug === normalizedTarget ||
        (normalizedTarget.length >= 2 && (normC.includes(normalizedTarget) || normalizedTarget.includes(normC))) ||
        (normalizedTarget.length >= 2 && (normCn.includes(normalizedTarget) || normalizedTarget.includes(normCn))) ||
        (normalizedTarget.length >= 2 && (normCatSlug.includes(normalizedTarget) || normalizedTarget.includes(normCatSlug)))
      );
    });
  } catch (err) {
    return [];
  }
};

// Legacy sync helpers — now backed by an empty list. Any page still using
// them will render an empty state; update those pages to call the async
// fetchers above when you're ready.
export const getProductById = () => null;
export const getProductsByCategory = () => [];

// ─── REVIEWS SERVICE ──────────────────────────────────────────────────────
const REVIEWS_STORAGE_PREFIX = "product_reviews_";

export const fetchProductReviews = async (slug) => {
  if (!slug) return { reviews: [], averageRating: 0, totalRatingsCount: 0 };
  let remoteData = null;
  try {
    const res = await axios.get(`${BACKEND_URL}/shop/products/public/slug/${slug}/reviews`);
    if (res.data?.success && res.data?.data) {
      remoteData = res.data.data;
    }
  } catch (err) {
    // silently continue to check localStorage cache
  }

  // Load locally saved reviews
  let localReviews = [];
  try {
    const raw = localStorage.getItem(`${REVIEWS_STORAGE_PREFIX}${slug}`);
    if (raw) localReviews = JSON.parse(raw);
  } catch {}

  const mergedReviews = [...(remoteData?.reviews || [])];
  localReviews.forEach((lr) => {
    if (!mergedReviews.some((mr) => mr.createdAt === lr.createdAt && mr.userName === lr.userName)) {
      mergedReviews.unshift(lr);
    }
  });

  const total = mergedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const avg = mergedReviews.length > 0 ? Number((total / mergedReviews.length).toFixed(1)) : 0;

  return {
    reviews: mergedReviews,
    averageRating: avg,
    totalRatingsCount: mergedReviews.length,
  };
};

export const submitProductReview = async (slug, reviewData) => {
  if (!slug) throw new Error("Product slug is required");

  // Save to localStorage immediately for instant UI reaction and offline durability
  const newReview = {
    userName: reviewData.userName || "Verified Buyer",
    rating: Number(reviewData.rating) || 5,
    headline: reviewData.headline || "",
    comment: reviewData.comment || "",
    verified: true,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(`${REVIEWS_STORAGE_PREFIX}${slug}`);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(newReview);
    localStorage.setItem(`${REVIEWS_STORAGE_PREFIX}${slug}`, JSON.stringify(existing));
  } catch {}

  // Attempt backend POST
  try {
    const res = await axios.post(`${BACKEND_URL}/shop/products/public/slug/${slug}/reviews`, {
      rating: newReview.rating,
      userName: newReview.userName,
      headline: newReview.headline,
      comment: newReview.comment,
    });
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn("Backend review endpoint unreachable, review saved locally:", err?.message);
  }

  return {
    review: newReview,
    success: true,
  };
};
