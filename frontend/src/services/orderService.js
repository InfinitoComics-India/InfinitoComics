import axios from 'axios';
import { BASE_URL } from '../utils/constants';
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
            <img src="/logo.svg" alt="Infinito Comics" class="logo-img" />
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
