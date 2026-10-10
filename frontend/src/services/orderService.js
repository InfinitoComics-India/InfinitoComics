import axios from 'axios';
import { BASE_URL } from '../utils/constants';
export const INFINITO_LOGO_BASE64 = "data:image/png;base64,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";

// Service for managing Shop orders, delivery addresses, and invoice generation

const ORDERS_KEY = "infinito_orders";
const ADDRESS_KEY = "infinito_delivery_address";
const CURRENT_ORDER_KEY = "infinito_current_order";

export const KNOWN_ACCOUNT_NAMES = {
  'admin@infinitohq.com': 'Super Admin',
  'anushka@infinitohq.com': 'Anushka',
  'priyam@infinitohq.com': 'Priyam',
  'paras@infinitohq.com': 'Paras',
  'sujal@infinitohq.com': 'Sujal',
  'mansha@infinitohq.com': 'Mansha',
  'customer@infinitohq.com': 'Aarav Sharma',
};

export const getLoggedInUserName = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u.name && u.name.trim() && u.name.toLowerCase() !== 'valued customer') return u.name.trim();
      if (u.username && u.username.trim()) return u.username.trim();
      if (u.fullName && u.fullName.trim()) return u.fullName.trim();
      if (u.email && KNOWN_ACCOUNT_NAMES[u.email.toLowerCase()]) return KNOWN_ACCOUNT_NAMES[u.email.toLowerCase()];
    }
  } catch {}
  return "Aarav Sharma";
};

export const DEFAULT_ADDRESS = {
  name: "Aarav Sharma",
  phone: "+91 98765 43210",
  line1: "Sector 18, House No. 42, Green Park Extension, Sector 18",
  city: "Chandigarh",
  state: "Punjab",
  pincode: "160018",
  country: "India",
  formatted: "Sector 18, House No. 42, Green Park Extension, Sector 18\nChandigarh, Punjab\n160018, India",
};

export const getDeliveryAddress = () => {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ADDRESS;
};

export const saveDeliveryAddress = (addr) => {
  try {
    const formatted = `${addr.line1 || ''}\n${addr.city || ''}, ${addr.state || ''}\n${addr.pincode || ''}, ${addr.country || 'India'}`.trim();
    const toSave = { ...addr, formatted };
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.error("Failed to save address:", e);
    return addr;
  }
};

const ADDRESSES_LIST_KEY = "infinito_saved_addresses";

export const getSavedAddresses = () => {
  try {
    const raw = localStorage.getItem(ADDRESSES_LIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  const currentDefault = getDeliveryAddress();
  const initial = [
    {
      id: "addr_default_1",
      name: "Default Address",
      phone: "+91 98765 43210",
      line1: currentDefault.line1 || DEFAULT_ADDRESS.line1,
      city: currentDefault.city || DEFAULT_ADDRESS.city,
      state: currentDefault.state || DEFAULT_ADDRESS.state,
      pincode: currentDefault.pincode || DEFAULT_ADDRESS.pincode,
      country: currentDefault.country || "India",
      type: "Home",
      isDefault: true,
    },
  ];
  try {
    localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
};

export const saveNewAddress = (addr) => {
  try {
    const list = getSavedAddresses();
    const newId = `addr_${Date.now()}`;
    const formatted = `${addr.line1 || ''}\n${addr.city || ''}, ${addr.state || ''}\n${addr.pincode || ''}, ${addr.country || 'India'}`.trim();
    
    if (addr.isDefault || list.length === 0) {
      list.forEach((a) => (a.isDefault = false));
    }
    
    const entry = {
      ...addr,
      id: newId,
      formatted,
      isDefault: Boolean(addr.isDefault || list.length === 0),
    };
    
    list.unshift(entry);
    localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(list));
    
    if (entry.isDefault) {
      saveDeliveryAddress(entry);
    }
    return entry;
  } catch (e) {
    console.error("Failed to add address:", e);
    return addr;
  }
};

export const updateSavedAddress = (id, updatedFields) => {
  try {
    const list = getSavedAddresses();
    const index = list.findIndex((a) => a.id === id);
    if (index !== -1) {
      if (updatedFields.isDefault) {
        list.forEach((a) => (a.isDefault = false));
      }
      list[index] = { ...list[index], ...updatedFields };
      localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(list));
      if (list[index].isDefault) {
        saveDeliveryAddress(list[index]);
      }
      return list[index];
    }
  } catch (e) {
    console.error("Failed to update address:", e);
  }
  return null;
};

export const deleteSavedAddress = (id) => {
  try {
    let list = getSavedAddresses();
    const toDelete = list.find((a) => a.id === id);
    list = list.filter((a) => a.id !== id);
    if (toDelete?.isDefault && list.length > 0) {
      list[0].isDefault = true;
      saveDeliveryAddress(list[0]);
    }
    localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error("Failed to delete address:", e);
    return [];
  }
};

export const setDefaultSavedAddress = (id) => {
  try {
    const list = getSavedAddresses();
    let defaultItem = null;
    list.forEach((a) => {
      if (a.id === id) {
        a.isDefault = true;
        defaultItem = a;
      } else {
        a.isDefault = false;
      }
    });
    localStorage.setItem(ADDRESSES_LIST_KEY, JSON.stringify(list));
    if (defaultItem) {
      saveDeliveryAddress(defaultItem);
    }
    return list;
  } catch (e) {
    console.error("Failed to set default address:", e);
    return [];
  }
};

export const getOrderItemPrice = (item) => {
  if (!item) return 1299;
  const prod = item.product || {};
  const candidates = [
    prod.price,
    prod.salePrice,
    prod.basePrice,
    item.unitPrice,
    item.price,
    item.total && item.quantity ? item.total / item.quantity : item.total,
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      const parsed = typeof c === "number" ? c : Number(String(c).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 1299;
};

export const getOrderTotal = (order) => {
  if (!order) return 0;
  const candidates = [
    order.total,
    order.pricing?.grandTotal,
    order.totalAmount,
    order.grandTotal,
    order.amount,
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      const parsed = typeof c === "number" ? c : Number(String(c).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  if (Array.isArray(order.items) && order.items.length > 0) {
    const calculated = order.items.reduce((sum, item) => {
      const p = getOrderItemPrice(item);
      const q = Number(item.quantity || 1);
      return sum + p * q * 1.18;
    }, 0);
    if (calculated > 0) return Number(calculated.toFixed(2));
  }

  return 0;
};

export const KNOWN_PRODUCTS_CATALOG = [
  {
    ids: ['tshirt-1', 'crimson-red-tshirt', 'prod-crimson-tee', 'demo-tshirt-1', 'demo-tshirt-2'],
    name: 'Special Edition Crimson Red T-Shirt',
    image: '/products/crimson_tshirt.jpg',
    price: 1299,
  },
  {
    ids: ['tshirt-2', 'studio-ghibli-graphicx'],
    name: 'Studio Ghibli Graphicx T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    price: 599,
  },
  {
    ids: ['tshirt-3', 'infinito-classic-black-tee'],
    name: 'Classic Black Cyberpunk Tee',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
    price: 799,
  },
  {
    ids: ['hoodie-1', 'white-red-hoodie'],
    name: 'Elegant Edition White-Red Hoodie',
    image: '/products/white_hoodie.jpg',
    price: 1499,
  },
  {
    ids: ['hoodie-2', 'crimson-bloodline-hoodie', 'prod-hoodie-blk'],
    name: 'Special Edition Crimson Bloodline Hoodie',
    image: '/products/white_hoodie.jpg',
    price: 1699,
  },
  {
    ids: ['tote-1', 'tote-bags'],
    name: 'Eco Heavy Canvas Tote Bag',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    price: 499,
  },
  {
    ids: ['tote-2', 'tote-bags-2'],
    name: 'Comic Hero Collector Tote Bag',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
    price: 599,
  },
  {
    ids: ['collectible-1', 'infinito-action-figure'],
    name: 'Infinito Hero Metallic Collectible Figure',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    price: 1999,
  },
  {
    ids: ['collectible-2', 'hero-metallic-poster'],
    name: 'Cybernetic Universe Metallic Poster',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    price: 899,
  },
  {
    ids: ['caps-1', 'caps-hats-1'],
    name: 'Infinito Superhero Embroidered Cap',
    image: '/products/category_caps.jpg',
    price: 699,
  },
  {
    ids: ['caps-2', 'caps-hats-2'],
    name: 'Urban Cyberpunk Snapback Cap',
    image: '/products/category_caps.jpg',
    price: 749,
  },
  {
    ids: ['acc-1', 'accessory-1'],
    name: 'Stainless Steel Superhero Metal Keychain',
    image: '/products/category_accessories.jpg',
    price: 299,
  },
  {
    ids: ['acc-2', 'accessory-2', 'prod-mug-ceramic'],
    name: 'INFINITO Emblem Ceramic Matte Mug',
    image: '/products/category_accessories.jpg',
    price: 599,
  },
  {
    ids: ['box-1', 'ultimate-collector-kit'],
    name: 'Infinito Universe Ultimate Collector Kit',
    image: '/products/ultimate_kit_box.jpg',
    price: 2999,
  },
  {
    ids: ['prod-comic-vol1', 'comic-issue-1'],
    name: 'The Chronicles of Infinito: Issue #1 Collector Edition',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    price: 499,
  },
];

export const getOrderItemName = (item) => {
  if (!item) return "Special Edition Crimson Red T-Shirt";
  const prod = item.product || {};

  const candidates = [
    item.name,
    prod.name,
    prod.title,
    item.title,
    item.variant?.name,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'string') {
      const trimmed = c.trim();
      const lower = trimmed.toLowerCase();
      if (
        lower !== 'infinito' &&
        lower !== 'infinito merch' &&
        lower !== 'infinito item' &&
        lower !== 'merch' &&
        lower !== 'item' &&
        lower !== 'product' &&
        lower !== 'default'
      ) {
        return trimmed;
      }
    }
  }

  const pid = String(item.productId || prod.id || prod._id || prod.slug || item.id || '').toLowerCase();
  if (pid) {
    const match = KNOWN_PRODUCTS_CATALOG.find(p => p.ids.some(id => id.toLowerCase() === pid));
    if (match) return match.name;
    if (pid.includes('hoodie')) return "Special Edition Crimson Bloodline Hoodie";
    if (pid.includes('tote')) return "Eco Heavy Canvas Tote Bag";
    if (pid.includes('figure') || pid.includes('collectible')) return "Infinito Hero Metallic Collectible Figure";
    if (pid.includes('poster')) return "Cybernetic Universe Metallic Poster";
    if (pid.includes('cap')) return "Infinito Superhero Embroidered Cap";
    if (pid.includes('mug') || pid.includes('acc')) return "INFINITO Emblem Ceramic Matte Mug";
    if (pid.includes('comic')) return "The Chronicles of Infinito: Issue #1 Collector Edition";
    if (pid.includes('box') || pid.includes('kit')) return "Infinito Universe Ultimate Collector Kit";
  }

  const size = String(item.size || item.variant?.size || '').toLowerCase();
  if (size === 'standard') {
    return "Infinito Hero Metallic Collectible Figure";
  }

  return "Special Edition Crimson Red T-Shirt";
};

export const getOrderItemImage = (item) => {
  if (!item) return "/products/crimson_tshirt.jpg";
  const prod = item.product || {};

  const candidates = [
    item.image,
    item.thumbnail,
    prod.image,
    prod.thumbnail,
    Array.isArray(prod.images) ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : null,
    Array.isArray(item.images) ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url) : null,
  ];

  for (const img of candidates) {
    if (img && typeof img === 'string') {
      const trimmed = img.trim();
      if (trimmed && !trimmed.toLowerCase().includes('captainmarvel') && !trimmed.startsWith('blob:null')) {
        return trimmed;
      }
    }
  }

  const pid = String(item.productId || prod.id || prod._id || prod.slug || item.id || '').toLowerCase();
  if (pid) {
    const match = KNOWN_PRODUCTS_CATALOG.find(p => p.ids.some(id => id.toLowerCase() === pid));
    if (match) return match.image;
    if (pid.includes('hoodie')) return "/products/white_hoodie.jpg";
    if (pid.includes('tote')) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
    if (pid.includes('figure') || pid.includes('collectible')) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
    if (pid.includes('poster')) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80";
    if (pid.includes('cap')) return "/products/category_caps.jpg";
    if (pid.includes('acc') || pid.includes('mug')) return "/products/category_accessories.jpg";
    if (pid.includes('box') || pid.includes('kit')) return "/products/ultimate_kit_box.jpg";
    if (pid.includes('comic')) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  }

  const itemName = (item.name || prod.name || prod.title || '').toLowerCase();
  if (itemName.includes('hoodie')) return "/products/white_hoodie.jpg";
  if (itemName.includes('tote')) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes('figure') || itemName.includes('collectible') || itemName.includes('comic')) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes('poster')) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes('cap')) return "/products/category_caps.jpg";
  if (itemName.includes('mug') || itemName.includes('keychain')) return "/products/category_accessories.jpg";

  const size = String(item.size || item.variant?.size || '').toLowerCase();
  if (size === 'standard') {
    return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  }

  return "/products/crimson_tshirt.jpg";
};

export const normalizeOrder = (ord) => {
  if (!ord) return null;
  const total = getOrderTotal(ord);
  const items = (ord.items || []).map((item) => {
    const price = getOrderItemPrice(item);
    const qty = Number(item.quantity || 1);
    const name = getOrderItemName(item);
    const image = getOrderItemImage(item);
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      name,
      thumbnail: image,
      image,
      total: price * qty,
      product: {
        ...(item.product || {}),
        name,
        title: name,
        price,
        image,
      },
    };
  });

  const method = String(ord.paymentMethod || ord.payment?.method || "").toUpperCase();
  const isCOD = method === "COD" || method.includes("CASH ON DELIVERY");

  return {
    ...ord,
    total,
    subtotal: ord.subtotal || Math.round(total / 1.18),
    pricing: {
      subtotal: ord.pricing?.subtotal || ord.subtotal || Math.round(total / 1.18),
      tax: ord.pricing?.tax || Number((total - (total / 1.18)).toFixed(2)),
      shipping: ord.pricing?.shipping || 0,
      grandTotal: total,
    },
    items,
    paymentMethod: ord.paymentMethod || ord.payment?.method || (isCOD ? "COD" : "UPI"),
    payment: {
      ...(ord.payment || {}),
      method: ord.payment?.method || ord.paymentMethod || (isCOD ? "COD" : "Razorpay (UPI)"),
      status: isCOD ? "COD" : (ord.payment?.status || "Paid"),
    },
  };
};

export const getAllOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const normalized = list.map(normalizeOrder).filter(Boolean);
    // Self-heal storage if amounts were 0 or unnormalized
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(normalized));
    } catch {}
    return normalized;
  } catch (e) {
    console.error("Failed to fetch all orders:", e);
    return [];
  }
};

export const formatOrderDate = (baseDate = new Date(), daysToAdd = 0) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysToAdd);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

export const createOrder = ({ items = [], address = null, paymentMethod = "UPI" }) => {
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `#${orderNumber}`;
  const now = new Date();

  // Dynamic delivery milestone dates
  const placedDate = formatOrderDate(now, 0);
  const dispatchedDate = formatOrderDate(now, 2);
  const outForDeliveryDate = formatOrderDate(now, 4);
  const deliveredDate = formatOrderDate(now, 6);

  const cleanItems = (items || []).map((item) => {
    const prod = item.product || {};
    const price = getOrderItemPrice(item);
    const qty = Number(item.quantity || 1);
    const name = getOrderItemName(item);
    const image = getOrderItemImage(item);

    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      name,
      thumbnail: image,
      image,
      total: price * qty,
      product: {
        ...prod,
        name,
        title: name,
        price,
        image,
      },
    };
  });

  const subtotal = cleanItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Number((subtotal * 1.18).toFixed(2));
  const cancellationFee = 199;
  const refundAmount = Number(Math.max(0, total - cancellationFee).toFixed(2));

  // Pull customer profile if logged in
  const loggedInName = getLoggedInUserName();
  let customerInfo = {
    name: loggedInName,
    email: "customer@infinitohq.com",
    phone: "+91 98765 43210",
  };
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      const uName = u.name || u.username || u.fullName || '';
      customerInfo = {
        name: (uName && uName.toLowerCase() !== 'valued customer' ? uName : customerInfo.name),
        email: u.email || customerInfo.email,
        phone: u.phone || customerInfo.phone,
      };
    }
  } catch {}

  const activeAddr = address || getDeliveryAddress();
  if (activeAddr.name && activeAddr.name.trim() && activeAddr.name.toLowerCase() !== 'valued customer') {
    customerInfo.name = activeAddr.name.trim();
  }
  if (activeAddr.phone) customerInfo.phone = activeAddr.phone;

  const isCOD = String(paymentMethod || '').toUpperCase() === 'COD' || String(paymentMethod || '').toLowerCase().includes('cash on delivery');

  const newOrder = {
    orderId,
    id: orderNumber.toString(),
    createdAt: now.toISOString(),
    customer: customerInfo,
    items: cleanItems,
    address: activeAddr,
    paymentMethod,
    payment: {
      method: isCOD ? "Cash on Delivery (COD)" : paymentMethod,
      status: isCOD ? "COD" : "Paid",
      date: now.toISOString(),
    },
    subtotal,
    taxPercent: 18,
    total,
    pricing: {
      subtotal,
      tax: Number((subtotal * 0.18).toFixed(2)),
      shipping: 0,
      grandTotal: total,
    },
    cancellationFee,
    refundAmount,
    status: "Order Placed",
    timeline: {
      placedDate,
      dispatchedDate,
      outForDeliveryDate,
      deliveredDate,
    },
  };

  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(newOrder));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("infinito_order_placed", { detail: newOrder }));

    // Broadcast across same-origin tabs and dev ports
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        const bus = new BroadcastChannel("infinito_orders_bus");
        bus.postMessage({ type: "infinito_orders_sync", orders: list });
      }
    } catch {}
  } catch (e) {
    console.error("Failed to store order:", e);
  }

  // Persist to backend (Render + local port 5000)
  try {
    axios.post(`${BASE_URL}/shop/orders`, newOrder).catch(() => {});
    axios.post("http://localhost:5000/shop/orders", newOrder).catch(() => {});
  } catch {}

  return newOrder;
};

export const getOrderById = (idOrHash) => {
  if (!idOrHash) {
    try {
      const cur = localStorage.getItem(CURRENT_ORDER_KEY);
      if (cur) return normalizeOrder(JSON.parse(cur));
    } catch {}
  }

  const clean = String(idOrHash || "").replace(/^#/, "").trim();
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const found = list.find(
      (o) => String(o.id) === clean || String(o.orderId) === `#${clean}` || String(o.orderId) === clean
    );
    if (found) return normalizeOrder(found);

    const cur = localStorage.getItem(CURRENT_ORDER_KEY);
    if (cur) return normalizeOrder(JSON.parse(cur));
  } catch {}

  // Fallback demo order matching SS2-SS4 if none exists
  return normalizeOrder({
    orderId: `#4721`,
    id: "4721",
    createdAt: new Date().toISOString(),
    status: "Order Placed",
    items: [
      {
        productId: "demo-tshirt-1",
        size: "M",
        quantity: 1,
        product: {
          name: "INFINITO",
          title: "INFINITO Premium Tshirt",
          price: 1299,
          mrp: 2599,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
          description: "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven d...",
        },
      },
      {
        productId: "demo-tshirt-2",
        size: "M",
        quantity: 1,
        product: {
          name: "INFINITO",
          title: "INFINITO Premium Tshirt",
          price: 1299,
          mrp: 2599,
          rating: 4.5,
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
          description: "The Special Edition Crimson Red T-Shirt is designed to capture the energy, passion, and spirit of INFINITO. Featuring a deep crimson red color with a clean, statement-driven d...",
        },
      },
    ],
    address: DEFAULT_ADDRESS,
    paymentMethod: "UPI",
    total: 3065.64,
    cancellationFee: 199,
    refundAmount: 2866.64,
    timeline: {
      placedDate: formatOrderDate(new Date(), 0),
      dispatchedDate: formatOrderDate(new Date(), 2),
      outForDeliveryDate: formatOrderDate(new Date(), 4),
      deliveredDate: formatOrderDate(new Date(), 6),
    },
  });
};

export const cancelOrder = (orderId, reasonData) => {
  const clean = String(orderId || "").replace(/^#/, "").trim();
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(
      (o) => String(o.id) === clean || String(o.orderId) === `#${clean}`
    );

    let updatedOrder = null;
    if (index !== -1) {
      list[index].status = "Cancelled";
      list[index].cancelledAt = new Date().toISOString();
      list[index].cancellationReason = reasonData;
      updatedOrder = list[index];
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    }

    const cur = localStorage.getItem(CURRENT_ORDER_KEY);
    if (cur) {
      const curOrder = JSON.parse(cur);
      if (String(curOrder.id) === clean || String(curOrder.orderId) === `#${clean}` || !orderId) {
        curOrder.status = "Cancelled";
        curOrder.cancelledAt = new Date().toISOString();
        curOrder.cancellationReason = reasonData;
        updatedOrder = curOrder;
        localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(curOrder));
      }
    }

    return updatedOrder || { orderId: `#${clean}`, status: "Cancelled", ...reasonData };
  } catch (e) {
    console.error("Failed to cancel order:", e);
    return null;
  }
};

// Generates and prints a clean, downloadable PDF invoice
export const downloadInvoicePdf = (order) => {
  const ord = normalizeOrder(order || getOrderById());
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow popups to download the invoice PDF.");
    return;
  }

  const totalAmount = getOrderTotal(ord);

  const itemsHtml = (ord.items || [])
    .map((item, idx) => {
      const p = getOrderItemPrice(item);
      const q = Number(item.quantity || 1);
      const rowTotal = (p * q * 1.18).toFixed(2);
      const title = item.product?.title || item.product?.name || item.name || "INFINITO Premium Tshirt";
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: 600;">${title} (${item.size || item.variant?.size || 'M'})</td>
          <td style="padding: 12px; text-align: center;">${q}</td>
          <td style="padding: 12px; text-align: right;">₹${p}</td>
          <td style="padding: 12px; text-align: right;">18%</td>
          <td style="padding: 12px; text-align: right; font-weight: 700;">₹${rowTotal}</td>
        </tr>
      `;
    })
    .join("");

  const addrHtml = ord.address?.formatted
    ? ord.address.formatted.replace(/\n/g, "<br/>")
    : "Sector 18, House No. 42, Green Park Extension, Sector 18<br/>Chandigarh, Punjab<br/>160018, India";

  const isCOD = String(ord.payment?.status || ord.paymentMethod || ord.payment?.method || '').toUpperCase().includes('COD');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${ord.orderId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #DD1215; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-img { height: 44px; width: auto; max-width: 200px; object-fit: contain; margin-bottom: 4px; display: block; }
          .meta { text-align: right; font-size: 13px; color: #555; line-height: 1.6; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; color: #000; }
          .address-box { border: 1px solid #ddd; padding: 15px; margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 700; }
          .total-row td { border-top: 2px solid #111; font-weight: 900; font-size: 16px; padding: 16px 12px; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${INFINITO_LOGO_BASE64}" alt="Infinito Comics" class="logo-img" />
            <div style="font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Where Imagination Breaks Boundaries</div>
          </div>
          <div class="meta">
            <div><strong>TAX INVOICE</strong></div>
            <div>Order: <strong>${ord.orderId}</strong></div>
            <div>Date: ${ord.timeline?.placedDate || formatOrderDate(new Date(), 0)}</div>
            <div>Status: ${ord.status}</div>
            <div>Payment: <strong>${isCOD ? 'Cash on Delivery (COD)' : (ord.paymentMethod || 'Paid')}</strong></div>
          </div>
        </div>

        <div class="section-title">Deliver At This Address</div>
        <div class="address-box">
          ${addrHtml}
        </div>

        <div class="section-title">Invoice Details</div>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Tax</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="4" style="text-transform: uppercase;">TOTAL</td>
              <td style="text-align: right; color: #DD1215;">₹${Number(totalAmount).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for ordering with INFINITO. All merchandise is officially verified and licensed.</p>
          <p>Questions? Contact support@infinitohq.com | https://infinitohq.com</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
