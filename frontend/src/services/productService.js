import axios from 'axios';
import { BASE_URL } from '../utils/constants';

// Initial dynamic products dataset (used if backend API is offline or returning empty)
const DEFAULT_PRODUCTS = [
  // T-Shirts Category
  {
    id: 'tshirt-1',
    slug: 'crimson-red-tshirt',
    title: 'INFINITO',
    name: 'Special Edition Crimson Red T-Shirt',
    category: 'T-Shirts',
    price: '₹1299',
    mrp: 'MRP ₹2599',
    description: 'The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven design, this piece is made to stand out while keeping things effortlessly wearable.',
    images: [
      '/products/crimson_tshirt.jpg',
      '/products/crimson_tshirt.jpg',
      '/products/crimson_tshirt.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      { label: 'Sleeve Length', value: 'Half Sleeve' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Length', value: 'Regular' },
      { label: 'Transparency', value: 'Opaque' },
      { label: 'Material', value: '100% Premium Cotton' },
      { label: 'Wash Care', value: 'Machine Wash Cold' },
    ],
    rating: 4.5,
    reviewsCount: 35,
  },
  {
    id: 'tshirt-2',
    slug: 'studio-ghibli-graphicx',
    title: 'INFINITO',
    name: 'Studio Ghibli Graphicx T-Shirt',
    category: 'T-Shirts',
    price: '₹599',
    mrp: 'MRP ₹1199',
    description: 'Official Studio Ghibli graphic tee crafted with ultra-soft combed cotton. Features vibrant Japanese anime inspired print with durable stitching.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    specifications: [
      { label: 'Sleeve Length', value: 'Half Sleeve' },
      { label: 'Fit', value: 'Oversized Fit' },
      { label: 'Length', value: 'Regular' },
      { label: 'Transparency', value: 'Opaque' },
    ],
    rating: 4.8,
    reviewsCount: 42,
  },
  {
    id: 'tshirt-3',
    slug: 'infinito-classic-black-tee',
    title: 'INFINITO',
    name: 'Classic Black Cyberpunk Tee',
    category: 'T-Shirts',
    price: '₹799',
    mrp: 'MRP ₹1499',
    description: 'Dark aesthetic minimalist black tee engineered for fans who demand comfort and endurance. Features subtle reflective INFINITO chest badge.',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      '/products/crimson_tshirt.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    specifications: [
      { label: 'Sleeve Length', value: 'Half Sleeve' },
      { label: 'Fit', value: 'Slim Fit' },
      { label: 'Length', value: 'Regular' },
      { label: 'Transparency', value: 'Opaque' },
    ],
    rating: 4.6,
    reviewsCount: 28,
  },

  // Hoodies Category
  {
    id: 'hoodie-1',
    slug: 'white-red-hoodie',
    title: 'INFINITO',
    name: 'Elegant Edition White-Red Hoodie',
    category: 'Hoodies',
    price: '₹1499',
    mrp: 'MRP ₹2999',
    description: 'Heavyweight fleece hoodie styled with contrasting crimson drawstrings and INFINITO target emblem on lower kangaroo pocket. Designed for warmth and futuristic streetwear style.',
    images: [
      '/products/white_hoodie.jpg',
      '/products/white_hoodie.jpg',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: [
      { label: 'Sleeve Length', value: 'Full Sleeve' },
      { label: 'Fit', value: 'Relaxed Fit' },
      { label: 'Fabric', value: '350 GSM Fleece Cotton' },
      { label: 'Closure', value: 'Half Zip / Pull Over' },
    ],
    rating: 4.9,
    reviewsCount: 56,
  },
  {
    id: 'hoodie-2',
    slug: 'crimson-bloodline-hoodie',
    title: 'INFINITO',
    name: 'Special Edition Crimson Bloodline Hoodie',
    category: 'Hoodies',
    price: '₹1699',
    mrp: 'MRP ₹3299',
    description: 'Deep red oversized thermal hoodie crafted with double-lined hood and ribbed cuffs. Iconic Infinito superhero universe insignia.',
    images: [
      '/products/crimson_tshirt.jpg',
      '/products/white_hoodie.jpg',
    ],
    sizes: ['M', 'L', 'XL'],
    specifications: [
      { label: 'Sleeve Length', value: 'Full Sleeve' },
      { label: 'Fit', value: 'Oversized' },
      { label: 'Fabric', value: 'Cotton Blend Fleece' },
      { label: 'Transparency', value: 'Opaque' },
    ],
    rating: 4.7,
    reviewsCount: 19,
  },

  // Tote Bags Category
  {
    id: 'tote-1',
    slug: 'tote-bags',
    title: 'INFINITO',
    name: 'Eco Heavy Canvas Tote Bag',
    category: 'Tote Bags',
    price: '₹499',
    mrp: 'MRP ₹999',
    description: 'Durable 100% organic cotton canvas tote bag featuring high-density INFINITO comic universe artwork. Reinforced straps and interior zippered pocket.',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: ['ONE SIZE'],
    specifications: [
      { label: 'Material', value: 'Heavy Canvas 400 GSM' },
      { label: 'Dimensions', value: '15" x 16" x 4"' },
      { label: 'Strap Drop', value: '11 Inches' },
      { label: 'Closure', value: 'Inner Zip' },
    ],
    rating: 4.6,
    reviewsCount: 31,
  },
  {
    id: 'tote-2',
    slug: 'tote-bags-2',
    title: 'INFINITO',
    name: 'Comic Hero Collector Tote Bag',
    category: 'Tote Bags',
    price: '₹599',
    mrp: 'MRP ₹1199',
    description: 'Special edition comic panels printed tote bag with double stitched shoulder straps and water-resistant lining inside.',
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: ['ONE SIZE'],
    specifications: [
      { label: 'Material', value: 'Water-Resistant Canvas' },
      { label: 'Dimensions', value: '16" x 17"' },
      { label: 'Closure', value: 'Magnetic Snap' },
    ],
    rating: 4.8,
    reviewsCount: 14,
  },

  // Collectibles Category
  {
    id: 'collectible-1',
    slug: 'infinito-action-figure',
    title: 'INFINITO',
    name: 'Infinito Hero Metallic Collectible Figure',
    category: 'Collectibles',
    price: '₹1999',
    mrp: 'MRP ₹3999',
    description: 'Limited edition hand-painted metallic figurine standing 8 inches tall on custom display stand. Comes with serial numbered certificate of authenticity.',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: ['STANDARD'],
    specifications: [
      { label: 'Material', value: 'Die-cast & Resin' },
      { label: 'Height', value: '8.5 Inches' },
      { label: 'Edition', value: 'Limited (500 units)' },
    ],
    rating: 4.9,
    reviewsCount: 88,
  },
  {
    id: 'collectible-2',
    slug: 'hero-metallic-poster',
    title: 'INFINITO',
    name: 'Cybernetic Universe Metallic Poster',
    category: 'Collectibles',
    price: '₹899',
    mrp: 'MRP ₹1799',
    description: 'High-definition foil printed metal wall poster with magnetic mounting system. Scratch resistant matte finish.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    ],
    sizes: ['A3 METAL'],
    specifications: [
      { label: 'Material', value: 'Aluminium Metal' },
      { label: 'Finish', value: 'Matte Metallic' },
      { label: 'Size', value: '12" x 18"' },
    ],
    rating: 4.7,
    reviewsCount: 23,
  },
];

// Fetch all available products (combining API products & dynamic fallbacks)
export const getAllProducts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/products`);
    if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    // API not yet live or returning empty array, fallback cleanly to dataset
  }
  return DEFAULT_PRODUCTS;
};

// Get a single product by ID, slug, or matching category string
export const getProductByIdOrSlug = async (param) => {
  const products = await getAllProducts();
  if (!param) return products[0];

  const cleanParam = String(param).toLowerCase().replace(/^:/, '').trim();

  // 1. Direct match by ID or slug
  let match = products.find(
    (p) =>
      p.id.toLowerCase() === cleanParam ||
      (p.slug && p.slug.toLowerCase() === cleanParam)
  );

  if (match) return match;

  // 2. Partial match on category or title
  match = products.find(
    (p) =>
      p.category.toLowerCase().includes(cleanParam) ||
      cleanParam.includes(p.category.toLowerCase()) ||
      p.name.toLowerCase().includes(cleanParam)
  );

  if (match) return match;

  // 3. Fallback to first item if none matched
  return products[0];
};

// Get random products from the SAME category as current product
export const getCategorySuggestedProducts = async (categoryName, currentProductId, count = 4) => {
  const allProducts = await getAllProducts();
  
  if (!categoryName) {
    return allProducts.filter(p => p.id !== currentProductId).slice(0, count);
  }

  const normalizedCategory = String(categoryName).toLowerCase();

  // Filter products matching category
  let categoryProducts = allProducts.filter(
    (p) =>
      p.category.toLowerCase() === normalizedCategory ||
      p.category.toLowerCase().includes(normalizedCategory) ||
      normalizedCategory.includes(p.category.toLowerCase())
  );

  // Exclude current product if possible
  let filtered = categoryProducts.filter((p) => p.id !== currentProductId);

  // If not enough products in exact category, fill with remaining products from catalog
  if (filtered.length < count) {
    const remaining = allProducts.filter(
      (p) => p.id !== currentProductId && !filtered.some((f) => f.id === p.id)
    );
    filtered = [...filtered, ...remaining];
  }

  // Shuffle array randomly
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
