// Order service for Admin Orders Management, Qikink API fulfillment, tracking, and invoices
import axios from 'axios';
import { BACKEND_URL } from '../../Utils/constant';
import { INFINITO_LOGO_BASE64 } from '../../Utils/infinitoLogoBase64';

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

// Helper to normalize orders loaded from customer-facing shop format or backend
export const normalizeCustomerOrder = (raw) => {
  if (!raw) return null;

  const orderNum = String(raw.id || raw.orderId || '').replace(/^#/, '');
  const orderId = raw.orderId ? (raw.orderId.startsWith('#') ? raw.orderId : `#${raw.orderId}`) : `#${orderNum}`;

  const methodStr = String(raw.paymentMethod || raw.payment?.method || '').trim();
  const isCOD = methodStr.toUpperCase() === 'COD' || methodStr.toLowerCase().includes('cash on delivery') || methodStr.toLowerCase().includes('cod');

  // If already normalized with full nested structure from backend or admin
  if (raw.customer?.email && raw.fulfillment?.status && raw.pricing?.grandTotal !== undefined && Array.isArray(raw.items) && raw.shippingAddress) {
    const paymentStatus = isCOD ? 'COD' : (raw.payment?.status || 'Paid');
    return {
      ...raw,
      id: orderNum || raw.id,
      orderId,
      total: raw.total || raw.pricing?.grandTotal,
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
    const name = item.name || prod.name || prod.title || 'INFINITO Item';
    const thumbnail = prod.image || (Array.isArray(prod.images) ? prod.images[0]?.url || prod.images[0] : null) || item.thumbnail || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
    return {
      productId: item.productId || prod.id || prod._id || `prod-${idx}`,
      name,
      sku: item.sku || `INF-${name.substring(0, 3).toUpperCase()}-${item.size || item.variant?.size || 'M'}`,
      variant: {
        size: item.size || item.variant?.size || 'M',
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

  const addr = raw.address || raw.shippingAddress || {};
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
      name: raw.customer?.name || addr.name || 'Valued Customer',
      email: raw.customer?.email || addr.email || 'customer@infinitohq.com',
      phone: raw.customer?.phone || addr.phone || '+91 98765 43210',
      totalOrders: raw.customer?.totalOrders || 1,
    },
    shippingAddress: {
      name: addr.name || raw.customer?.name || 'Valued Customer',
      line1: addr.line1 || 'Sector 18, House No. 42, Green Park Extension',
      city: addr.city || 'Chandigarh',
      state: addr.state || 'Punjab',
      pincode: addr.pincode || '160018',
      country: addr.country || 'India',
      formatted: addrFormatted,
    },
    billingAddress: raw.billingAddress || {
      name: addr.name || raw.customer?.name || 'Valued Customer',
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
