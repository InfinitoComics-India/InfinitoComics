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
  const sizeVariant = p.variants?.find((v) => v.name?.toLowerCase().includes("size"));
  const parsedSizes = sizeVariant?.options?.map((o) => o.value?.toUpperCase()).filter(Boolean) || [];

  const rawImages = Array.isArray(p.images)
    ? p.images.map((img) => resolveImageUrl(img?.url || img)).filter(Boolean)
    : [];

  const primaryImage =
    rawImages[0] ||
    resolveImageUrl(p.image) ||
    fallbackCategoryImages[p.categorySlug?.toLowerCase()] ||
    fallbackCategoryImages[p.category?.slug?.toLowerCase()] ||
    tshirtsImg;

  const currentPrice = Number(p.salePrice || p.basePrice || 0);
  const currentMrp = p.basePrice && p.salePrice && Number(p.basePrice) > Number(p.salePrice)
    ? Number(p.basePrice)
    : Math.round(currentPrice * 1.6);

  const catSlug = p.category?.slug || p.categorySlug || (typeof p.category === "string" ? p.category : "") || "";
  const catName = p.category?.name || p.categorySlug || "";

  return {
    id: p._id,
    _id: p._id,
    name: "INFINITO",
    title: p.name || "INFINITO",
    description:
      p.description ||
      p.shortDescription ||
      "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.",
    price: currentPrice,
    mrp: currentMrp,
    category: catSlug,
    categoryName: catName,
    slug: p.slug,
    image: primaryImage,
    gallery: rawImages.length > 0 ? rawImages : [primaryImage],
    sizes: parsedSizes.length > 0 ? parsedSizes : ["XS", "S", "M", "L", "XL", "XXL"],
    variants: p.variants || [],
    rating: 4.5,
    reviewsCount: 35,
    ratingBreakdown: { 5: 35, 4: 35, 3: 35, 2: 35, 1: 35 },
    specs: p.specifications || p.specs || {
      "Sleeve Length": "Half Sleeve",
      "Fit": "Regular Fit",
      "Length": "Regular",
      "Transparency": "Opaque",
      "Material": "100% Cotton",
      "Wash Care": "Machine Wash",
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

// All products in a category (category listing page).
export const fetchProductsByCategory = async (categorySlug) => {
  if (!categorySlug) return [];
  const cleanSlug = String(categorySlug).toLowerCase().trim();
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/category/${cleanSlug}`
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
    return all.filter((p) => {
      const c = String(p.category || "").toLowerCase();
      const cn = String(p.categoryName || "").toLowerCase();
      return (
        c === cleanSlug ||
        cn === cleanSlug ||
        (cleanSlug.length > 2 && c.includes(cleanSlug)) ||
        (c.length > 2 && cleanSlug.includes(c))
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
