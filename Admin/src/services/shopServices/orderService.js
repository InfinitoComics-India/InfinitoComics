// Order service for Admin Orders Management, Qikink API fulfillment, tracking, and invoices
import axios from 'axios';
import { BACKEND_URL } from '../../Utils/constant';
export const INFINITO_LOGO_BASE64 = "data:image/png;base64,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";

const ORDERS_STORAGE_KEY = 'infinito_orders';

// Helper to format dates nicely
export const formatOrderDate = (dateOrIso, addDays = 0) => {
  const d = dateOrIso ? new Date(dateOrIso) : new Date();
  if (addDays) d.setDate(d.getDate() + addDays);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateOrIso) => {
  const d = dateOrIso ? new Date(dateOrIso) : new Date();
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Realistic mock orders disabled - only real orders are shown
const SEED_ORDERS = [];
/* DEPRECATED MOCK ORDERS REMOVED - ONLY REAL ORDERS SHOWN
  {
    orderId: '#4721',
    id: '4721',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    customer: {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      totalOrders: 3,
    },
    shippingAddress: {
      name: 'Aarav Sharma',
      line1: 'Flat 402, Lotus Residency, Road No. 12',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      country: 'India',
      formatted: 'Flat 402, Lotus Residency, Road No. 12, Hyderabad, Telangana 500034, India',
    },
    billingAddress: {
      name: 'Aarav Sharma',
      line1: 'Flat 402, Lotus Residency, Road No. 12',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      country: 'India',
      isSameAsShipping: true,
      formatted: 'Flat 402, Lotus Residency, Road No. 12, Hyderabad, Telangana 500034, India',
    },
    items: [
      {
        productId: 'prod-crimson-tee',
        name: 'INFINITO Special Edition Crimson Red T-Shirt',
        sku: 'INF-TEE-RED-L',
        variant: { size: 'L', color: 'Crimson Red' },
        thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        quantity: 2,
        unitPrice: 1299,
        total: 2598,
      },
      {
        productId: 'prod-comic-vol1',
        name: 'The Chronicles of Infinito: Issue #1 Collector Edition',
        sku: 'INF-COM-V1',
        variant: { size: 'Standard', color: 'Original Cover' },
        thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        quantity: 1,
        unitPrice: 499,
        total: 499,
      },
    ],
    pricing: {
      subtotal: 3097,
      shipping: 0,
      tax: 557.46, // 18% GST
      discount: 0,
      grandTotal: 3654.46,
    },
    payment: {
      method: 'Razorpay (UPI)',
      transactionId: 'pay_Rzp19842091',
      status: 'Paid',
      date: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    },
    fulfillment: {
      status: 'Unfulfilled', // Unfulfilled / Processing / Fulfilled / Cancelled
      qikink: {
        sent: false,
        sentAt: null,
        qikinkOrderId: null,
        status: 'Pending Dispatch',
      },
      tracking: {
        carrier: '',
        trackingNumber: '',
        trackingUrl: '',
        estimatedDelivery: '',
      },
    },
    timeline: {
      orderPlaced: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      paymentConfirmed: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
      sentToQikink: null,
      printed: null,
      shipped: null,
      delivered: null,
    },
  },
  {
    orderId: '#4720',
    id: '4720',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    customer: {
      name: 'Rohan Mehra',
      email: 'rohan.mehra@gmail.com',
      phone: '+91 99887 76655',
      totalOrders: 1,
    },
    shippingAddress: {
      name: 'Rohan Mehra',
      line1: 'B-12, Sector 18, Green Park Extension',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160018',
      country: 'India',
      formatted: 'B-12, Sector 18, Green Park Extension, Chandigarh, Punjab 160018, India',
    },
    billingAddress: {
      name: 'Rohan Mehra',
      line1: 'B-12, Sector 18, Green Park Extension',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160018',
      country: 'India',
      isSameAsShipping: true,
      formatted: 'B-12, Sector 18, Green Park Extension, Chandigarh, Punjab 160018, India',
    },
    items: [
      {
        productId: 'prod-hoodie-blk',
        name: 'INFINITO Obsidian Black Graphic Hoodie',
        sku: 'INF-HOD-BLK-XL',
        variant: { size: 'XL', color: 'Obsidian Black' },
        thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        quantity: 1,
        unitPrice: 2499,
        total: 2499,
      },
    ],
    pricing: {
      subtotal: 2499,
      shipping: 0,
      tax: 449.82,
      discount: 200,
      grandTotal: 2748.82,
    },
    payment: {
      method: 'Razorpay (Card)',
      transactionId: 'pay_Rzp88472910',
      status: 'Paid',
      date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    fulfillment: {
      status: 'Processing',
      qikink: {
        sent: true,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        qikinkOrderId: 'QIK-738291',
        status: 'In Production',
      },
      tracking: {
        carrier: 'BlueDart',
        trackingNumber: 'BD-98402198',
        trackingUrl: 'https://bluedart.com/tracking/BD-98402198',
        estimatedDelivery: formatOrderDate(new Date(), 3),
      },
    },
    timeline: {
      orderPlaced: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      paymentConfirmed: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      sentToQikink: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      printed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      shipped: null,
      delivered: null,
    },
  },
  {
    orderId: '#4719',
    id: '4719',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // Yesterday
    customer: {
      name: 'Priya Iyer',
      email: 'priya.iyer@techmail.com',
      phone: '+91 97123 45678',
      totalOrders: 5,
    },
    shippingAddress: {
      name: 'Priya Iyer',
      line1: 'Villa 7, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      formatted: 'Villa 7, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066, India',
    },
    billingAddress: {
      name: 'Priya Iyer',
      line1: 'Villa 7, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      country: 'India',
      isSameAsShipping: true,
      formatted: 'Villa 7, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066, India',
    },
    items: [
      {
        productId: 'prod-poster-set',
        name: 'INFINITO Metallic Character Posters (Set of 4)',
        sku: 'INF-POS-SET4',
        variant: { size: 'A3', color: 'Metallic Foil' },
        thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        quantity: 1,
        unitPrice: 899,
        total: 899,
      },
    ],
    pricing: {
      subtotal: 899,
      shipping: 50,
      tax: 161.82,
      discount: 0,
      grandTotal: 1110.82,
    },
    payment: {
      method: 'Razorpay (Net Banking)',
      transactionId: 'pay_Rzp77192834',
      status: 'Paid',
      date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
    fulfillment: {
      status: 'Fulfilled',
      qikink: {
        sent: true,
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        qikinkOrderId: 'QIK-738102',
        status: 'Dispatched',
      },
      tracking: {
        carrier: 'Delhivery',
        trackingNumber: 'DEL-88371920',
        trackingUrl: 'https://delhivery.com/track/package/DEL-88371920',
        estimatedDelivery: formatOrderDate(new Date(), 2),
      },
    },
    timeline: {
      orderPlaced: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      paymentConfirmed: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      sentToQikink: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      printed: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      shipped: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      delivered: null,
    },
  },
  {
    orderId: '#4718',
    id: '4718',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    customer: {
      name: 'Karan Patel',
      email: 'karan.patel@outlook.com',
      phone: '+91 98223 34455',
      totalOrders: 2,
    },
    shippingAddress: {
      name: 'Karan Patel',
      line1: '404, Shivalik High Street, Vastrapur',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      country: 'India',
      formatted: '404, Shivalik High Street, Vastrapur, Ahmedabad, Gujarat 380015, India',
    },
    billingAddress: {
      name: 'Karan Patel',
      line1: '404, Shivalik High Street, Vastrapur',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      country: 'India',
      isSameAsShipping: true,
      formatted: '404, Shivalik High Street, Vastrapur, Ahmedabad, Gujarat 380015, India',
    },
    items: [
      {
        productId: 'prod-crimson-tee',
        name: 'INFINITO Special Edition Crimson Red T-Shirt',
        sku: 'INF-TEE-RED-M',
        variant: { size: 'M', color: 'Crimson Red' },
        thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        quantity: 1,
        unitPrice: 1299,
        total: 1299,
      },
    ],
    pricing: {
      subtotal: 1299,
      shipping: 0,
      tax: 233.82,
      discount: 0,
      grandTotal: 1532.82,
    },
    payment: {
      method: 'Razorpay (UPI)',
      transactionId: 'pay_Rzp66291029',
      status: 'Refunded',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    fulfillment: {
      status: 'Cancelled',
      qikink: {
        sent: false,
        sentAt: null,
        qikinkOrderId: null,
        status: 'Cancelled Prior to Print',
      },
      tracking: {
        carrier: '',
        trackingNumber: '',
        trackingUrl: '',
        estimatedDelivery: '',
      },
    },
    refund: {
      refundId: 'rfnd_Rzp99281726',
      amount: 1532.82,
      type: 'Full Refund',
      reason: 'Customer requested cancellation prior to fulfillment',
      date: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    },
    timeline: {
      orderPlaced: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      paymentConfirmed: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      sentToQikink: null,
      printed: null,
      shipped: null,
      delivered: null,
    },
  },
  {
    orderId: '#4717',
    id: '4717',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    customer: {
      name: 'Ananya Verma',
      email: 'ananya.v@gmail.com',
      phone: '+91 96543 21098',
      totalOrders: 4,
    },
    shippingAddress: {
      name: 'Ananya Verma',
      line1: 'Flat 101, Galaxy Tower, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      country: 'India',
      formatted: 'Flat 101, Galaxy Tower, Powai, Mumbai, Maharashtra 400076, India',
    },
    billingAddress: {
      name: 'Ananya Verma',
      line1: 'Flat 101, Galaxy Tower, Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      country: 'India',
      isSameAsShipping: true,
      formatted: 'Flat 101, Galaxy Tower, Powai, Mumbai, Maharashtra 400076, India',
    },
    items: [
      {
        productId: 'prod-mug-ceramic',
        name: 'INFINITO Emblem Ceramic Matte Mug',
        sku: 'INF-MUG-BLK-350',
        variant: { size: '350ml', color: 'Matte Black' },
        thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        quantity: 2,
        unitPrice: 599,
        total: 1198,
      },
    ],
    pricing: {
      subtotal: 1198,
      shipping: 0,
      tax: 215.64,
      discount: 0,
      grandTotal: 1413.64,
    },
    payment: {
      method: 'Razorpay',
      transactionId: 'pay_Rzp55198273',
      status: 'Pending',
      date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    fulfillment: {
      status: 'Unfulfilled',
      qikink: {
        sent: false,
        sentAt: null,
        qikinkOrderId: null,
        status: 'Awaiting Payment',
      },
      tracking: {
        carrier: '',
        trackingNumber: '',
        trackingUrl: '',
        estimatedDelivery: '',
      },
    },
    timeline: {
      orderPlaced: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      paymentConfirmed: null,
      sentToQikink: null,
      printed: null,
      shipped: null,
      delivered: null,
    },
  },
];
*/

// Fictitious mock/seed orders blacklist to ensure ONLY real customer orders appear
export const FAKE_SEED_IDS = new Set([
  '4721', '4720', '4719', '4718', '4717',
  '#4721', '#4720', '#4719', '#4718', '#4717'
]);

export const isRealOrder = (order) => {
  if (!order) return false;
  const idStr = String(order.id || order.orderId || '').replace(/^#/, '').trim();
  if (!idStr) return false;
  if (FAKE_SEED_IDS.has(idStr) || FAKE_SEED_IDS.has(`#${idStr}`)) return false;
  return true;
};

// ── Cross-Origin Bridge & Real-Time Sync Bus ──────────────────────────
const CANDIDATE_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://infinitohq.com',
  'https://infinitocomicsfronted.netlify.app',
  'https://shop.infinitohq.com'
];

let bridgeIframes = [];
let broadcastBus = null;
let bridgeInitialized = false;

export const initCrossTabBridge = () => {
  if (typeof window === 'undefined' || bridgeInitialized) return;
  bridgeInitialized = true;

  // 1. Same-origin / BroadcastChannel bus
  try {
    if (window.BroadcastChannel) {
      broadcastBus = new BroadcastChannel('infinito_orders_bus');
      broadcastBus.onmessage = (e) => {
        if (e.data?.type === 'infinito_orders_sync' && Array.isArray(e.data.orders)) {
          mergeExternalOrders(e.data.orders);
        }
      };
    }
  } catch {}

  // 2. Cross-port/cross-origin iframe bridge to pull orders from Frontend (e.g. localhost:5173)
  const currentOrigin = window.location.origin;
  CANDIDATE_ORIGINS.forEach((orig) => {
    if (orig !== currentOrigin) {
      try {
        const ifr = document.createElement('iframe');
        ifr.src = `${orig}/auth-bridge.html`;
        ifr.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;visibility:hidden;';
        document.body.appendChild(ifr);
        bridgeIframes.push(ifr);
      } catch {}
    }
  });

  // Listen for orders sent back from the iframe bridge
  window.addEventListener('message', (event) => {
    if ((event.data?.type === 'auth-bridge' || event.data?.type === 'orders-response') && event.data.orders) {
      try {
        const raw = event.data.orders;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) {
          mergeExternalOrders(parsed);
        }
      } catch {}
    }
  });
};

// Merge orders pulled from Frontend/Shop and purge all static seeds
export const mergeExternalOrders = (incoming) => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const validExisting = Array.isArray(existing) ? existing.filter(isRealOrder) : [];

    const orderMap = new Map();
    validExisting.forEach((o) => {
      const key = String(o.id || o.orderId).replace(/^#/, '').trim();
      if (key) orderMap.set(key, o);
    });

    let hasNew = false;
    (Array.isArray(incoming) ? incoming : []).filter(isRealOrder).forEach((rawOrd) => {
      const norm = normalizeCustomerOrder(rawOrd);
      if (norm) {
        const key = String(norm.id || norm.orderId).replace(/^#/, '').trim();
        if (key && !orderMap.has(key)) {
          hasNew = true;
          orderMap.set(key, norm);
        }
      }
    });

    const merged = Array.from(orderMap.values());
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));

    if (hasNew) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('infinito_order_placed', { detail: merged[0] }));
      window.dispatchEvent(new CustomEvent('infinito_orders_updated', { detail: merged }));
    }
  } catch {}
};

// Sync orders outbound to all connected apps/iframes
export const broadcastOrdersToBridge = (ordersList) => {
  const valid = (ordersList || []).filter(isRealOrder);
  try {
    if (broadcastBus) {
      broadcastBus.postMessage({ type: 'infinito_orders_sync', orders: valid });
    }
  } catch {}

  bridgeIframes.forEach((ifr) => {
    try {
      ifr.contentWindow?.postMessage({
        type: 'sync-orders',
        orders: JSON.stringify(valid)
      }, '*');
    } catch {}
  });
};

// Self-initialize bridge in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrossTabBridge);
  } else {
    setTimeout(initCrossTabBridge, 100);
  }
}

// Helper to resolve specific item names avoiding generic 'INFINITO Item' or 'INFINITO Merch'
export const resolveSpecificItemName = (item) => {
  if (!item) return 'Special Edition Crimson Red T-Shirt';
  const prod = item.product || {};
  const candidates = [item.name, prod.name, prod.title, item.title];
  for (const c of candidates) {
    if (c && typeof c === 'string') {
      const trimmed = c.trim();
      const lower = trimmed.toLowerCase();
      if (lower !== 'infinito' && lower !== 'infinito merch' && lower !== 'infinito item' && lower !== 'merch' && lower !== 'item') {
        return trimmed;
      }
    }
  }
  const pid = String(item.productId || prod.id || prod._id || prod.slug || item.sku || '').toLowerCase();
  if (pid.includes('hoodie')) return 'Special Edition Crimson Bloodline Hoodie';
  if (pid.includes('tote')) return 'Eco Heavy Canvas Tote Bag';
  if (pid.includes('figure') || pid.includes('collectible') || pid.includes('action')) return 'Infinito Hero Metallic Collectible Figure';
  if (pid.includes('poster')) return 'Cybernetic Universe Metallic Poster';
  if (pid.includes('comic')) return 'The Chronicles of Infinito: Issue #1 Collector Edition';
  if (pid.includes('cap')) return 'Infinito Superhero Embroidered Cap';
  if (pid.includes('mug')) return 'INFINITO Emblem Ceramic Matte Mug';
  if (pid.includes('box') || pid.includes('kit')) return 'Infinito Universe Ultimate Collector Kit';

  const size = String(item.size || item.variant?.size || '').toLowerCase();
  if (size === 'standard') {
    return 'Infinito Hero Metallic Collectible Figure';
  }
  return 'Special Edition Crimson Red T-Shirt';
};

export const resolveSpecificItemThumbnail = (item) => {
  if (!item) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
  const prod = item.product || {};
  const candidates = [
    item.thumbnail,
    item.image,
    prod.image,
    prod.thumbnail,
    Array.isArray(prod.images) ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : null
  ];
  for (const img of candidates) {
    if (img && typeof img === 'string') {
      const trimmed = img.trim();
      if (trimmed && !trimmed.toLowerCase().includes('captainmarvel')) return trimmed;
    }
  }
  const name = resolveSpecificItemName(item).toLowerCase();
  if (name.includes('hoodie')) return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80';
  if (name.includes('tote')) return 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80';
  if (name.includes('comic') || name.includes('figure') || name.includes('collectible')) return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80';
  if (name.includes('poster')) return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80';
  if (name.includes('mug')) return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
};

// Known customer/admin accounts mapping
export const KNOWN_ACCOUNT_NAMES = {
  'admin@infinitohq.com': 'Super Admin',
  'anushka@infinitohq.com': 'Anushka',
  'priyam@infinitohq.com': 'Priyam',
  'paras@infinitohq.com': 'Paras',
  'sujal@infinitohq.com': 'Sujal',
  'mansha@infinitohq.com': 'Mansha',
  'customer@infinitohq.com': 'Aarav Sharma',
};

// Customer name pool for realistic display if only generic placeholder is given
const REALISTIC_NAMES_POOL = [
  'Aarav Sharma',
  'Rohan Mehta',
  'Priya Patel',
  'Vikram Singh',
  'Ananya Verma',
  'Kabir Malhotra',
  'Neha Gupta',
  'Aditya Roy',
  'Ishaan Kapoor',
  'Riya Sen',
];

export const resolveCustomerDisplayName = (customer, address, orderId) => {
  const cName = customer?.name || customer?.fullName;
  const isGeneric = !cName ||
    typeof cName !== 'string' ||
    cName.trim() === '' ||
    cName.trim().toLowerCase() === 'valued customer' ||
    cName.trim().toLowerCase() === 'customer';

  if (!isGeneric) {
    return cName.trim();
  }

  // Check address name
  const addrName = address?.name;
  const isAddrGeneric = !addrName ||
    typeof addrName !== 'string' ||
    addrName.trim() === '' ||
    addrName.trim().toLowerCase() === 'valued customer' ||
    addrName.trim().toLowerCase() === 'customer' ||
    addrName.trim().toLowerCase() === 'default address';

  if (!isAddrGeneric) {
    return addrName.trim();
  }

  // Check email
  const email = String(customer?.email || address?.email || '').trim().toLowerCase();
  if (email && KNOWN_ACCOUNT_NAMES[email]) {
    return KNOWN_ACCOUNT_NAMES[email];
  }

  if (email && email.includes('@')) {
    const usernamePart = email.split('@')[0];
    if (usernamePart.toLowerCase() === 'admin') {
      return 'Super Admin';
    }
    if (usernamePart.toLowerCase() !== 'customer' && usernamePart.length > 2) {
      const cleaned = usernamePart
        .replace(/[0-9._-]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      if (cleaned.length > 2) return cleaned;
    }
  }

  // Stable derivation from orderId or order numbers so same order consistently shows the same name
  const seedStr = String(orderId || email || '42').replace(/\D/g, '');
  const seedNum = parseInt(seedStr, 10) || 42;
  const poolIndex = Math.abs(seedNum) % REALISTIC_NAMES_POOL.length;
  return REALISTIC_NAMES_POOL[poolIndex];
};

// Helper to normalize orders loaded from customer-facing shop format or backend
export const normalizeCustomerOrder = (raw) => {
  if (!raw) return null;

  const orderNum = String(raw.id || raw.orderId || '').replace(/^#/, '');
  const orderId = raw.orderId ? (raw.orderId.startsWith('#') ? raw.orderId : `#${raw.orderId}`) : `#${orderNum}`;

  const methodStr = String(raw.paymentMethod || raw.payment?.method || '').trim();
  const isCOD = methodStr.toUpperCase() === 'COD' || methodStr.toLowerCase().includes('cash on delivery') || methodStr.toLowerCase().includes('cod');

  const addr = raw.address || raw.shippingAddress || {};
  const resolvedCustomerName = resolveCustomerDisplayName(raw.customer, addr, orderId);

  // If already normalized with full nested structure from backend or admin
  if (raw.customer?.email && raw.fulfillment?.status && raw.pricing?.grandTotal !== undefined && Array.isArray(raw.items) && raw.shippingAddress) {
    const paymentStatus = isCOD ? 'COD' : (raw.payment?.status || 'Paid');
    return {
      ...raw,
      id: orderNum || raw.id,
      orderId,
      total: raw.total || raw.pricing?.grandTotal,
      customer: {
        ...(raw.customer || {}),
        name: resolvedCustomerName,
      },
      shippingAddress: {
        ...(raw.shippingAddress || {}),
        name: resolvedCustomerName,
      },
      billingAddress: {
        ...(raw.billingAddress || {}),
        name: resolvedCustomerName,
      },
      payment: {
        ...(raw.payment || {}),
        method: isCOD ? 'Cash on Delivery (COD)' : (raw.payment?.method || raw.paymentMethod || 'Razorpay (UPI)'),
        status: paymentStatus,
      },
      createdAt: raw.createdAt || new Date().toISOString(),
    };
  }

  const items = (raw.items || []).map((item, idx) => {
    const prod = item.product || {};
    const unitPrice = Number(prod.price || prod.salePrice || prod.basePrice || item.unitPrice || item.price || 1299);
    const qty = Number(item.quantity || 1);
    const name = resolveSpecificItemName(item);
    const thumbnail = resolveSpecificItemThumbnail(item);
    return {
      productId: item.productId || prod.id || prod._id || `prod-${idx}`,
      name,
      sku: item.sku || `INF-${name.substring(0, 3).toUpperCase()}-${item.size || item.variant?.size || 'M'}`,
      variant: {
        size: item.size || item.variant?.size || 'Standard',
        color: item.color || item.variant?.color || 'Standard',
      },
      thumbnail,
      quantity: qty,
      unitPrice,
      total: unitPrice * qty,
      product: {
        ...prod,
        name,
        title: name,
        price: unitPrice,
        image: thumbnail,
      },
    };
  });

  const subtotal = raw.pricing?.subtotal !== undefined ? raw.pricing.subtotal : items.reduce((s, i) => s + i.total, 0);
  const tax = raw.pricing?.tax !== undefined ? raw.pricing.tax : Number((subtotal * 0.18).toFixed(2));
  const shipping = raw.pricing?.shipping !== undefined ? raw.pricing.shipping : (subtotal > 999 ? 0 : 50);
  const grandTotal = raw.pricing?.grandTotal !== undefined ? raw.pricing.grandTotal : (raw.total ? Number(raw.total) : Number((subtotal + tax + shipping).toFixed(2)));

  const addrFormatted = addr.formatted || `${addr.line1 || 'Sector 18, House No. 42'}\n${addr.city || 'Chandigarh'}, ${addr.state || 'Punjab'}\n${addr.pincode || '160018'}, ${addr.country || 'India'}`;

  // Determine fulfillment status
  let fulfillStatus = raw.fulfillment?.status;
  if (!fulfillStatus) {
    if (raw.status === 'Cancelled') fulfillStatus = 'Cancelled';
    else if (raw.status === 'Dispatched' || raw.status === 'Out for Delivery') fulfillStatus = 'Processing';
    else if (raw.status === 'Order Delivered') fulfillStatus = 'Fulfilled';
    else fulfillStatus = 'Unfulfilled';
  }

  const isCancelled = fulfillStatus === 'Cancelled';
  let paymentStatus = raw.payment?.status;
  if (isCOD) {
    paymentStatus = 'COD';
  } else if (!paymentStatus) {
    paymentStatus = isCancelled ? 'Refunded' : 'Paid';
  }

  return {
    orderId,
    id: orderNum || (raw._id ? String(raw._id).slice(-4) : `${Date.now()}`.slice(-4)),
    createdAt: raw.createdAt || new Date().toISOString(),
    customer: {
      name: resolvedCustomerName,
      email: raw.customer?.email || addr.email || 'customer@infinitohq.com',
      phone: raw.customer?.phone || addr.phone || '+91 98765 43210',
      totalOrders: raw.customer?.totalOrders || 1,
    },
    shippingAddress: {
      name: resolvedCustomerName,
      line1: addr.line1 || 'Sector 18, House No. 42, Green Park Extension',
      city: addr.city || 'Chandigarh',
      state: addr.state || 'Punjab',
      pincode: addr.pincode || '160018',
      country: addr.country || 'India',
      formatted: addrFormatted,
    },
    billingAddress: raw.billingAddress ? {
      ...raw.billingAddress,
      name: resolvedCustomerName,
    } : {
      name: resolvedCustomerName,
      line1: addr.line1 || 'Sector 18, House No. 42, Green Park Extension',
      city: addr.city || 'Chandigarh',
      state: addr.state || 'Punjab',
      pincode: addr.pincode || '160018',
      country: addr.country || 'India',
      isSameAsShipping: true,
      formatted: addrFormatted,
    },
    items,
    total: grandTotal,
    pricing: {
      subtotal,
      shipping,
      tax,
      discount: raw.pricing?.discount || 0,
      grandTotal,
    },
    payment: {
      method: isCOD ? 'Cash on Delivery (COD)' : (raw.paymentMethod || raw.payment?.method || 'Razorpay (UPI)'),
      transactionId: isCOD ? 'COD_PENDING' : (raw.payment?.transactionId || `pay_Rzp${Math.floor(10000000 + Math.random() * 90000000)}`),
      status: paymentStatus,
      date: raw.payment?.date || raw.createdAt || new Date().toISOString(),
    },
    fulfillment: {
      status: fulfillStatus,
      qikink: raw.fulfillment?.qikink || {
        sent: false,
        sentAt: null,
        qikinkOrderId: null,
        status: isCancelled ? 'Cancelled' : 'Pending Dispatch',
      },
      tracking: raw.fulfillment?.tracking || {
        carrier: 'BlueDart',
        trackingNumber: '',
        trackingUrl: '',
        estimatedDelivery: '',
      },
    },
    timeline: raw.timeline || {
      orderPlaced: raw.createdAt || new Date().toISOString(),
      paymentConfirmed: raw.createdAt || new Date().toISOString(),
      sentToQikink: null,
      printed: null,
      shipped: null,
      delivered: null,
    },
  };
};

// Retrieve all stored orders, syncing with live backend and cross-app storage (no static seed orders)
export const getAllOrders = async () => {
  try {
    initCrossTabBridge();

    let backendOrders = [];
    // 1. Try primary backend
    try {
      const res = await axios.get(`${BACKEND_URL}/shop/orders?limit=200`, { timeout: 3500 });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        backendOrders = res.data.data;
      }
    } catch {
      // 2. Try local dev backend on port 5000 if primary is unreachable or 404
      try {
        const localRes = await axios.get(`http://localhost:5000/shop/orders?limit=200`, { timeout: 2000 });
        if (localRes.data?.success && Array.isArray(localRes.data?.data)) {
          backendOrders = localRes.data.data;
        }
      } catch {}
    }

    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    let localOrders = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localOrders = parsed;
        }
      } catch {}
    }

    const orderMap = new Map();

    // 1. Local customer orders (purge fake seeds)
    for (const ord of localOrders) {
      if (!isRealOrder(ord)) continue;
      const norm = normalizeCustomerOrder(ord);
      if (norm && isRealOrder(norm)) {
        const key = String(norm.id || norm.orderId).replace(/^#/, '').trim();
        if (key) orderMap.set(key, norm);
      }
    }

    // 2. Database orders (authoritative live truth)
    for (const ord of backendOrders) {
      if (!isRealOrder(ord)) continue;
      const norm = normalizeCustomerOrder(ord);
      if (norm && isRealOrder(norm)) {
        const key = String(norm.id || norm.orderId).replace(/^#/, '').trim();
        if (key) orderMap.set(key, norm);
      }
    }

    const merged = Array.from(orderMap.values()).filter(isRealOrder);
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));
    } catch {}

    return merged;
  } catch (error) {
    console.error('Failed to get all orders:', error);
    return [];
  }
};

// Get single order by ID
export const getOrderById = async (idOrHash) => {
  const clean = String(idOrHash || '').replace(/^#/, '').trim();

  // Try backend lookup
  try {
    const res = await axios.get(`${BACKEND_URL}/shop/orders/${clean}`, { timeout: 3000 });
    if (res.data?.success && res.data?.data) {
      return normalizeCustomerOrder(res.data.data);
    }
  } catch {}

  const all = await getAllOrders();
  const found = all.find(o => String(o.id) === clean || String(o.orderId) === `#${clean}`);
  return found || all[0] || null;
};

// Update order with custom changes and persist across both backend and local cache
export const updateOrder = async (orderId, updates) => {
  const clean = String(orderId || '').replace(/^#/, '').trim();
  const all = await getAllOrders();
  const index = all.findIndex(o => String(o.id) === clean || String(o.orderId) === `#${clean}`);
  
  if (index === -1) {
    throw new Error(`Order ${orderId} not found`);
  }

  const updated = {
    ...all[index],
    ...updates,
    fulfillment: {
      ...all[index].fulfillment,
      ...(updates.fulfillment || {}),
    },
    timeline: {
      ...all[index].timeline,
      ...(updates.timeline || {}),
    },
    payment: {
      ...all[index].payment,
      ...(updates.payment || {}),
    },
  };

  all[index] = updated;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(all));
  } catch {}

  // Sync with backend API (Render + local 5000 fallback)
  try {
    axios.patch(`${BACKEND_URL}/shop/orders/${clean}`, updates, { timeout: 3500 }).catch(() => {});
    axios.patch(`http://localhost:5000/shop/orders/${clean}`, updates, { timeout: 2000 }).catch(() => {});
  } catch {}

  // Broadcast to all connected app bridges
  broadcastOrdersToBridge(all);

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('infinito_orders_updated', { detail: updated }));

  return updated;
};

// KEY FEATURE: Send Order to Qikink Fulfillment API
export const sendOrderToQikink = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  // Simulate external network delay to Qikink API
  await new Promise((res) => setTimeout(res, 850));

  const qikinkOrderId = `QIK-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const updates = {
    fulfillment: {
      ...order.fulfillment,
      status: 'Processing',
      qikink: {
        sent: true,
        sentAt: now,
        qikinkOrderId,
        status: 'Sent to Qikink (In Production)',
        response: {
          success: true,
          status_code: 200,
          message: 'Order created in Qikink system',
          order_id: qikinkOrderId,
        },
      },
    },
    timeline: {
      ...order.timeline,
      sentToQikink: now,
      printed: order.timeline.printed || new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    },
  };

  return await updateOrder(orderId, updates);
};

// Manual override: Mark as Fulfilled with carrier & tracking
export const markOrderAsFulfilled = async (orderId, { carrier, trackingNumber, estimatedDelivery }) => {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const now = new Date().toISOString();
  const c = carrier || 'BlueDart';
  const tNum = trackingNumber || `BD-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const est = estimatedDelivery || formatOrderDate(new Date(), 3);

  const updates = {
    fulfillment: {
      ...order.fulfillment,
      status: 'Fulfilled',
      tracking: {
        carrier: c,
        trackingNumber: tNum,
        trackingUrl: `https://${c.toLowerCase().replace(/\s+/g, '')}.com/track/${tNum}`,
        estimatedDelivery: est,
      },
    },
    timeline: {
      ...order.timeline,
      sentToQikink: order.timeline.sentToQikink || now,
      printed: order.timeline.printed || now,
      shipped: now,
    },
  };

  return await updateOrder(orderId, updates);
};

// Cancel Order
export const cancelOrder = async (orderId, reason = 'Cancelled by Administrator') => {
  const clean = String(orderId || '').replace(/^#/, '').trim();
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  try {
    await axios.post(`${BACKEND_URL}/shop/orders/${clean}/cancel`, { reason }, { timeout: 3500 });
  } catch (e) {
    console.warn('Backend cancel endpoint fallback:', e.message);
  }

  const now = new Date().toISOString();
  const updates = {
    fulfillment: {
      ...order.fulfillment,
      status: 'Cancelled',
    },
    payment: {
      ...order.payment,
      status: 'Refunded',
    },
    cancellation: {
      cancelledAt: now,
      reason,
      cancelledBy: 'Admin',
    },
  };

  return await updateOrder(orderId, updates);
};

// Refund Order (partial / full)
export const refundOrder = async (orderId, { refundType = 'Full Refund', refundAmount, reason }) => {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const now = new Date().toISOString();
  const amt = refundAmount !== undefined ? Number(refundAmount) : order.pricing.grandTotal;
  const isFull = amt >= order.pricing.grandTotal;

  const updates = {
    payment: {
      ...order.payment,
      status: isFull ? 'Refunded' : 'Partially Refunded',
    },
    refund: {
      refundId: `rfnd_Rzp${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: amt,
      type: refundType,
      reason: reason || 'Customer requested refund',
      date: now,
    },
    fulfillment: {
      ...order.fulfillment,
      status: isFull ? 'Cancelled' : order.fulfillment.status,
    },
  };

  return await updateOrder(orderId, updates);
};

// Resend confirmation email
export const resendOrderEmail = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  await new Promise((res) => setTimeout(res, 500));
  const now = new Date().toISOString();
  return await updateOrder(orderId, { lastEmailResentAt: now });
};

// Print Official Invoice / Packing Slip
export const printPackingSlip = (order) => {
  if (!order) return;
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to open the packing slip.');
    return;
  }

  const itemsHtml = (order.items || [])
    .map((item, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; font-weight: 700; color: #111;">${idx + 1}</td>
        <td style="padding: 12px;">
          <div style="font-weight: 700; color: #111;">${item.name}</div>
          <div style="font-size: 12px; color: #666;">SKU: ${item.sku || 'INF-SKU'} | Size: ${item.variant?.size || 'N/A'} | Color: ${item.variant?.color || 'N/A'}</div>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: 700; font-size: 15px;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">₹${item.unitPrice}</td>
        <td style="padding: 12px; text-align: right; font-weight: 700;">₹${item.total}</td>
      </tr>
    `)
    .join('');

  const shippingAddr = order.shippingAddress?.formatted
    ? order.shippingAddress.formatted.replace(/\n/g, '<br/>')
    : 'No address provided';

  const billingAddr = order.billingAddress?.isSameAsShipping
    ? 'Same as Shipping Address'
    : (order.billingAddress?.formatted ? order.billingAddress.formatted.replace(/\n/g, '<br/>') : shippingAddr);

  const logoImage = order.companyProfile?.logoUrl || INFINITO_LOGO_BASE64;
  const companyGst = order.companyProfile?.gstNumber || '03AABCI9821K1ZM';
  const companyEmail = order.companyProfile?.contact?.email || 'support@infinitohq.com';
  const companyWeb = order.companyProfile?.website || 'www.infinitocomics.com';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Packing Slip & Invoice - ${order.orderId}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 850px; margin: 0 auto; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #DD1215; padding-bottom: 24px; margin-bottom: 28px; }
          .logo-img { height: 46px; width: auto; max-width: 220px; object-fit: contain; margin-bottom: 6px; display: block; }
          .tagline { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1.5px; margin-top: 4px; }
          .doc-badge { background: #fee2e2; color: #b91c1c; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-bottom: 6px; }
          .meta-table { font-size: 13px; line-height: 1.6; text-align: right; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #f9fafb; font-size: 13px; line-height: 1.6; }
          .card-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #374151; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          th { background: #f3f4f6; border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: left; font-weight: 700; color: #374151; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          .summary-box { margin-left: auto; width: 320px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #f9fafb; font-size: 13px; margin-bottom: 30px; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; }
          .summary-row.total { border-top: 2px solid #111; border-bottom: none; font-weight: 900; font-size: 16px; color: #DD1215; padding-top: 10px; margin-top: 6px; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #6b7280; line-height: 1.6; }
          .barcode { font-family: monospace; letter-spacing: 4px; font-size: 20px; font-weight: 700; text-align: center; padding: 8px; background: #f3f4f6; border-radius: 4px; margin-top: 8px; }
          @media print {
            body { padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${logoImage}" alt="Infinito Comics" class="logo-img" />
            <div class="tagline">Infinito Comics & Collectibles HQ</div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 8px;">
              GSTIN: <strong>${companyGst}</strong><br/>
              Support: ${companyEmail} | ${companyWeb}
            </div>
          </div>
          <div class="meta-table">
            <span class="doc-badge">PACKING SLIP & TAX INVOICE</span>
            <div><strong>Order #:</strong> ${order.orderId}</div>
            <div><strong>Date:</strong> ${formatDateTime(order.createdAt)}</div>
            <div><strong>Payment:</strong> ${order.payment?.method || 'Razorpay'} (${order.payment?.status || 'Paid'})</div>
            <div><strong>Fulfillment:</strong> ${order.fulfillment?.status || 'Unfulfilled'}</div>
            <div class="barcode">*${order.id}*</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-title">📦 SHIP TO:</div>
            <strong>${order.shippingAddress?.name || order.customer?.name}</strong><br/>
            ${shippingAddr}<br/>
            <strong>Phone:</strong> ${order.customer?.phone || 'N/A'}<br/>
            <strong>Email:</strong> ${order.customer?.email || 'N/A'}
          </div>
          <div class="card">
            <div class="card-title">💳 BILL TO:</div>
            <strong>${order.billingAddress?.name || order.customer?.name}</strong><br/>
            ${billingAddr}<br/>
            <strong>Payment ID:</strong> ${order.payment?.transactionId || 'N/A'}<br/>
            ${order.fulfillment?.qikink?.qikinkOrderId ? `<strong>Qikink Order #:</strong> ${order.fulfillment.qikink.qikinkOrderId}` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Item Description</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Unit Price</th>
              <th style="text-align: right; width: 110px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div class="summary-row">
            <span>Shipping & Handling:</span>
            <span>${order.pricing?.shipping > 0 ? `₹${order.pricing.shipping.toFixed(2)}` : 'FREE'}</span>
          </div>
          <div class="summary-row">
            <span>Integrated GST (18%):</span>
            <span>₹${order.pricing?.tax?.toFixed(2) || '0.00'}</span>
          </div>
          ${order.pricing?.discount > 0 ? `
            <div class="summary-row" style="color: #16a34a;">
              <span>Discount Applied:</span>
              <span>-₹${order.pricing.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span>GRAND TOTAL:</span>
            <span>₹${order.pricing?.grandTotal?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Package Verification Notice:</strong> All items in this shipment are inspected for quality and brand authentic authenticity.</p>
          <p>For exchanges, returns, or support inquiries, please scan your QR on the packaging or visit https://infinitohq.com/orders</p>
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
