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
const capsImg = tshirtsImg;

const fallbackCategoryImages = {
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
};

// Uploaded backend images arrive as "/uploads/shop/xxx.png" and need the
// backend host prepended. External URLs and data URIs are returned as-is.
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const base = BACKEND_URL?.replace(/\/$/, "") || "";
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
const mapBackendProduct = (p) => ({
  id: p._id,
  _id: p._id,
  name: "INFINITO",
  title: p.name,
  description: p.description || p.shortDescription || "",
  price: p.salePrice || p.basePrice || 0,
  mrp: p.basePrice || 0,
  category: p.category?.slug || p.categorySlug || "",
  slug: p.slug,
  image: resolveImageUrl(p.images?.[0]?.url || ""),
  gallery: (p.images || []).map((img) => resolveImageUrl(img.url)),
  sizes: [],
  rating: 0,
  reviewsCount: 0,
  ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  specs: {},
  featured: p.featured,
  stock: p.stock,
});

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

// Featured products only (Top Trending row).
export const fetchFeaturedProducts = async (limit = 10) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/featured`,
      { params: { limit } }
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
    return [];
  }
};

// Single product by slug (product detail page).
export const fetchProductBySlug = async (slug) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/slug/${slug}`
    );
    if (!data?.data) return null;
    return mapBackendProduct(data.data);
  } catch (err) {
    console.error("Failed to fetch product by slug:", err);
    return null;
  }
};

// All products in a category (category listing page).
export const fetchProductsByCategory = async (categorySlug) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/category/${categorySlug}`
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch products by category:", err);
    return [];
  }
};

// Legacy sync helpers — now backed by an empty list. Any page still using
// them will render an empty state; update those pages to call the async
// fetchers above when you're ready.
export const getProductById = () => null;
export const getProductsByCategory = () => [];
