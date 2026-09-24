// import axios from 'axios';
// import { BACKEND_URL } from '../utils/constants';

// Once the backend Product/Order APIs are ready, swap these dummy exports
// for real fetches. For example:
//
// export const getAllProducts = async () => {
//   const { data } = await axios.get(`${BACKEND_URL}/products`);
//   return data.data;
// };
//
// export const getProductById = async (id) => {
//   const { data } = await axios.get(`${BACKEND_URL}/products/${id}`);
//   return data.data;
// };

// Category card artwork already has "INFINITO T-Shirts" etc. baked in,
// so we import them as-is and skip the label overlay on the grid.
import tshirtsImg   from "../assets/categories/tshirts.svg";
import accessoryImg from "../assets/categories/accessory.svg";
import hoodiesImg   from "../assets/categories/hoodies.svg";
import totebagsImg  from "../assets/categories/totebags.svg";
// TODO: save `Shop/src/assets/categories/caps.svg` and swap this fallback.
const capsImg = tshirtsImg;

export const categories = [
  { id: 1, name: "T-Shirts",  slug: "tshirts",   image: tshirtsImg },
  { id: 2, name: "Caps/Hats", slug: "caps",      image: capsImg },
  { id: 3, name: "Accessory", slug: "accessory", image: accessoryImg },
  { id: 4, name: "Hoodies",   slug: "hoodies",   image: hoodiesImg },
  { id: 5, name: "Tote Bags", slug: "totebags",  image: totebagsImg },
];

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

export const getProductById = (id) => products.find((p) => p.id === id);
export const getProductsByCategory = (slug) =>
  slug ? products.filter((p) => p.category === slug) : products;
