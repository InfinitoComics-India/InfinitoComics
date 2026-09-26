import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

// Category card artwork already has "INFINITO T-Shirts" etc. baked in,
// so we import them as-is and skip the label overlay on the grid.
import tshirtsImg   from "../assets/categories/tshirts.svg";
import accessoryImg from "../assets/categories/accessory.svg";
import hoodiesImg   from "../assets/categories/hoodies.svg";
import totebagsImg  from "../assets/categories/totebags.svg";
// TODO: save `Shop/src/assets/categories/caps.svg` and swap this fallback.
const capsImg = tshirtsImg;

// Fallback artwork used when a backend category doesn't have its own image.
// Matches on slug (lowercased) so admin-created categories like "tshirts",
// "hoodies", "accessory", etc. still pick up the branded card if they exist.
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

// Static fallback used when the backend is unreachable, so the shop keeps
// rendering something recognizable during outages.
const staticCategories = [
  { id: 1, _id: "static-tshirts",  name: "T-Shirts",  slug: "tshirts",   image: tshirtsImg },
  { id: 2, _id: "static-caps",     name: "Caps/Hats", slug: "caps",      image: capsImg },
  { id: 3, _id: "static-accessory",name: "Accessory", slug: "accessory", image: accessoryImg },
  { id: 4, _id: "static-hoodies",  name: "Hoodies",   slug: "hoodies",   image: hoodiesImg },
  { id: 5, _id: "static-totebags", name: "Tote Bags", slug: "totebags",  image: totebagsImg },
];

// Kept as a synchronous export for existing components that read it directly.
// New code should call `fetchCategories()` and render the live list.
export const categories = staticCategories;

// Fetch categories from the backend. Falls back to static data on error so
// the storefront never renders a blank grid.
export const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/shop/categories/public/all`);
    const list = Array.isArray(data?.data) ? data.data : [];
    if (list.length === 0) return staticCategories;

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
    console.error("Failed to fetch categories, using static fallback:", err);
    return staticCategories;
  }
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────
// Static products kept as fallback until the backend product list is populated.
export const products = [
  {
    id: "p1",
    name: "INFINITO",
    title: "Special Edition Crimson Bloodline T-Shirt",
    description:
      "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.",
    price: 1299,
    mrp: 2599,
    category: "tshirts",
    image: "",
    gallery: ["", "", "", ""],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.5,
    reviewsCount: 175,
    ratingBreakdown: { 5: 35, 4: 35, 3: 35, 2: 35, 1: 35 },
    specs: {
      "Sleeve Length": "Half Sleeve",
      Fit: "Regular Fit",
      Length: "Regular",
      Transparency: "Opaque",
    },
  },
  {
    id: "p2",
    name: "INFINITO",
    title: "Elegant Edition White-Red Hoodie",
    description:
      "Premium quality hoodie with the signature INFINITO design. Perfect for casual outings and comic conventions.",
    price: 1499,
    mrp: 2999,
    category: "hoodies",
    image: "",
    gallery: ["", "", "", ""],
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.7,
    reviewsCount: 92,
    ratingBreakdown: { 5: 40, 4: 30, 3: 15, 2: 4, 1: 3 },
    specs: {
      "Sleeve Length": "Full Sleeve",
      Fit: "Regular Fit",
      Length: "Regular",
      Transparency: "Opaque",
    },
  },
  {
    id: "p3",
    name: "INFINITO",
    title: "Special Edition Crimson Bloodline",
    description: "Limited edition merchandise.",
    price: 1499,
    mrp: 2999,
    category: "tshirts",
    image: "",
    gallery: ["", "", "", ""],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.3,
    reviewsCount: 58,
    ratingBreakdown: { 5: 25, 4: 20, 3: 8, 2: 3, 1: 2 },
    specs: {
      "Sleeve Length": "Half Sleeve",
      Fit: "Regular Fit",
      Length: "Regular",
      Transparency: "Opaque",
    },
  },
  {
    id: "p4",
    name: "INFINITO",
    title: "Elegant Edition White-Red Hoodie",
    description: "Premium comfort hoodie.",
    price: 1499,
    mrp: 2999,
    category: "hoodies",
    image: "",
    gallery: ["", "", "", ""],
    sizes: ["M", "L", "XL"],
    rating: 4.6,
    reviewsCount: 41,
    ratingBreakdown: { 5: 22, 4: 12, 3: 5, 2: 1, 1: 1 },
    specs: {
      "Sleeve Length": "Full Sleeve",
      Fit: "Regular Fit",
      Length: "Regular",
      Transparency: "Opaque",
    },
  },
  {
    id: "p5",
    name: "INFINITO",
    title: "Elegant Edition White-Red Hoodie",
    description: "Signature merchandise.",
    price: 1499,
    mrp: 2999,
    category: "hoodies",
    image: "",
    gallery: ["", "", "", ""],
    sizes: ["S", "M", "L"],
    rating: 4.4,
    reviewsCount: 33,
    ratingBreakdown: { 5: 18, 4: 10, 3: 3, 2: 1, 1: 1 },
    specs: {
      "Sleeve Length": "Full Sleeve",
      Fit: "Regular Fit",
      Length: "Regular",
      Transparency: "Opaque",
    },
  },
];

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

// Fetch all active products from the backend. Falls back to static list on error.
export const fetchProducts = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/shop/products/public/all`);
    const list = Array.isArray(data?.data) ? data.data : [];
    if (list.length === 0) return products;
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch products, using static fallback:", err);
    return products;
  }
};

// Fetch featured products (used on the shop home).
export const fetchFeaturedProducts = async (limit = 10) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/featured`,
      { params: { limit } }
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    if (list.length === 0) return products;
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch featured products, using static fallback:", err);
    return products;
  }
};

// Fetch a single product by slug (used on the product detail page).
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

// Fetch all products for a category slug.
export const fetchProductsByCategory = async (categorySlug) => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/shop/products/public/category/${categorySlug}`
    );
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapBackendProduct);
  } catch (err) {
    console.error("Failed to fetch products by category:", err);
    return products.filter((p) => p.category === categorySlug);
  }
};

// Kept for existing components that still use the sync API against the static list.
export const getProductById = (id) => products.find((p) => p.id === id);
export const getProductsByCategory = (slug) =>
  slug ? products.filter((p) => p.category === slug) : products;
