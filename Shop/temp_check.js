// Shop/src/pages/Checkout/Checkout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Edit2,
  X,
  Check,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  ShieldCheck,
  Tag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Ticket,
  Percent,
  Gift,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";

// Shop/src/services/orderService.js
import axios from "axios";

// Shop/src/utils/constants.js
var FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_BASE_URL || import.meta.env.VITE_FRONTEND_URL || import.meta.env.FRONTEND_URL || "https://infinitohq.com";
var BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BASE_URL || import.meta.env.BACKEND_URL || "https://infinitocomics-68cr.onrender.com";
var BASE_URL = BACKEND_URL;
var RESEARCH_BASE_URL = import.meta.env.VITE_RESEARCH_BASE_URL || "https://research.infinitohq.com";
var FOUNDATION_BASE_URL = import.meta.env.VITE_FOUNDATION_BASE_URL || "https://foundation.infinitohq.com";

// Shop/src/services/orderService.js
var ORDERS_KEY = "infinito_orders";
var ADDRESS_KEY = "infinito_delivery_address";
var CURRENT_ORDER_KEY = "infinito_current_order";
var KNOWN_ACCOUNT_NAMES = {
  "admin@infinitohq.com": "Super Admin",
  "anushka@infinitohq.com": "Anushka",
  "priyam@infinitohq.com": "Priyam",
  "paras@infinitohq.com": "Paras",
  "sujal@infinitohq.com": "Sujal",
  "mansha@infinitohq.com": "Mansha"
};
var deriveNameFromEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  const em = email.toLowerCase().trim();
  if (em === "admin@infinitohq.com") return "Super Admin";
  if (KNOWN_ACCOUNT_NAMES[em]) return KNOWN_ACCOUNT_NAMES[em];
  const usernamePart = em.split("@")[0] || "";
  const cleaned = usernamePart.replace(/[._\-+0-9]+/g, " ").trim();
  if (cleaned) {
    return cleaned.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return usernamePart ? usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1) : "Customer";
};
var getLoggedInUserName = () => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u.email && u.email.toLowerCase() === "admin@infinitohq.com") return "Super Admin";
      if (u.name && u.name.trim() && u.name.toLowerCase() !== "valued customer" && u.name.toLowerCase() !== "aarav sharma") return u.name.trim();
      if (u.username && u.username.trim() && u.username.toLowerCase() !== "aarav sharma") return u.username.trim();
      if (u.fullName && u.fullName.trim() && u.fullName.toLowerCase() !== "aarav sharma") return u.fullName.trim();
      if (u.email) return deriveNameFromEmail(u.email);
    }
  } catch {
  }
  return "Customer";
};
var DEFAULT_ADDRESS = {
  name: "",
  phone: "+91 98765 43210",
  line1: "Sector 18, House No. 42, Green Park Extension, Sector 18",
  city: "Chandigarh",
  state: "Punjab",
  pincode: "160018",
  country: "India",
  formatted: "Sector 18, House No. 42, Green Park Extension, Sector 18\nChandigarh, Punjab\n160018, India"
};
var getDeliveryAddress = () => {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.name || parsed.name.toLowerCase() === "aarav sharma" || parsed.name.toLowerCase() === "valued customer") {
        parsed.name = getLoggedInUserName();
      }
      return parsed;
    }
  } catch {
  }
  return { ...DEFAULT_ADDRESS, name: getLoggedInUserName() };
};
var sanitizePhoneNumber = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(2).slice(-10);
  }
  return digits.slice(-10);
};
var sanitizePinCode = (raw) => {
  return String(raw || "").replace(/\D/g, "").slice(0, 6);
};
var saveDeliveryAddress = (addr) => {
  try {
    const cleanName = (addr.name || "").trim() || getLoggedInUserName();
    const cleanPhone = sanitizePhoneNumber(addr.phone) || "9876543210";
    const cleanPin = sanitizePinCode(addr.pincode) || "160018";
    const formatted = `${cleanName} (${cleanPhone})
${addr.line1 || ""}
${addr.city || ""}, ${addr.state || ""}
${cleanPin}, ${addr.country || "India"}`.trim();
    const toSave = {
      ...addr,
      name: cleanName,
      phone: cleanPhone,
      pincode: cleanPin,
      country: addr.country || "India",
      formatted
    };
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.error("Failed to save address:", e);
    return addr;
  }
};
var getOrderItemPrice = (item) => {
  if (!item) return 1299;
  const prod = item.product || {};
  const candidates = [
    prod.price,
    prod.salePrice,
    prod.basePrice,
    item.unitPrice,
    item.price,
    item.total && item.quantity ? item.total / item.quantity : item.total
  ];
  for (const c of candidates) {
    if (c !== void 0 && c !== null && c !== "") {
      const parsed = typeof c === "number" ? c : Number(String(c).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 1299;
};
var KNOWN_PRODUCTS_CATALOG = [
  {
    ids: ["tshirt-1", "crimson-red-tshirt", "prod-crimson-tee", "demo-tshirt-1", "demo-tshirt-2"],
    name: "Special Edition Crimson Red T-Shirt",
    image: "/products/crimson_tshirt.jpg",
    price: 1299
  },
  {
    ids: ["tshirt-2", "studio-ghibli-graphicx"],
    name: "Studio Ghibli Graphicx T-Shirt",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    price: 599
  },
  {
    ids: ["tshirt-3", "infinito-classic-black-tee"],
    name: "Classic Black Cyberpunk Tee",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    price: 799
  },
  {
    ids: ["hoodie-1", "white-red-hoodie"],
    name: "Elegant Edition White-Red Hoodie",
    image: "/products/white_hoodie.jpg",
    price: 1499
  },
  {
    ids: ["hoodie-2", "crimson-bloodline-hoodie", "prod-hoodie-blk"],
    name: "Special Edition Crimson Bloodline Hoodie",
    image: "/products/white_hoodie.jpg",
    price: 1699
  },
  {
    ids: ["tote-1", "tote-bags"],
    name: "Eco Heavy Canvas Tote Bag",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    price: 499
  },
  {
    ids: ["tote-2", "tote-bags-2"],
    name: "Comic Hero Collector Tote Bag",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
    price: 599
  },
  {
    ids: ["collectible-1", "infinito-action-figure"],
    name: "Infinito Hero Metallic Collectible Figure",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    price: 1999
  },
  {
    ids: ["collectible-2", "hero-metallic-poster"],
    name: "Cybernetic Universe Metallic Poster",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    price: 899
  },
  {
    ids: ["caps-1", "caps-hats-1"],
    name: "Infinito Superhero Embroidered Cap",
    image: "/products/category_caps.jpg",
    price: 699
  },
  {
    ids: ["caps-2", "caps-hats-2"],
    name: "Urban Cyberpunk Snapback Cap",
    image: "/products/category_caps.jpg",
    price: 749
  },
  {
    ids: ["acc-1", "accessory-1"],
    name: "Stainless Steel Superhero Metal Keychain",
    image: "/products/category_accessories.jpg",
    price: 299
  },
  {
    ids: ["acc-2", "accessory-2", "prod-mug-ceramic"],
    name: "INFINITO Emblem Ceramic Matte Mug",
    image: "/products/category_accessories.jpg",
    price: 599
  },
  {
    ids: ["box-1", "ultimate-collector-kit"],
    name: "Infinito Universe Ultimate Collector Kit",
    image: "/products/ultimate_kit_box.jpg",
    price: 2999
  },
  {
    ids: ["prod-comic-vol1", "comic-issue-1"],
    name: "The Chronicles of Infinito: Issue #1 Collector Edition",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
    price: 499
  }
];
var getOrderItemName = (item) => {
  if (!item) return "Special Edition Crimson Red T-Shirt";
  const prod = item.product || {};
  const candidates = [
    item.name,
    prod.name,
    prod.title,
    item.title,
    item.variant?.name
  ];
  for (const c of candidates) {
    if (c && typeof c === "string") {
      const trimmed = c.trim();
      const lower = trimmed.toLowerCase();
      if (lower !== "infinito" && lower !== "infinito merch" && lower !== "infinito item" && lower !== "merch" && lower !== "item" && lower !== "product" && lower !== "default") {
        return trimmed;
      }
    }
  }
  const pid = String(item.productId || prod.id || prod._id || prod.slug || item.id || "").toLowerCase();
  if (pid) {
    const match = KNOWN_PRODUCTS_CATALOG.find((p) => p.ids.some((id) => id.toLowerCase() === pid));
    if (match) return match.name;
    if (pid.includes("hoodie")) return "Special Edition Crimson Bloodline Hoodie";
    if (pid.includes("tote")) return "Eco Heavy Canvas Tote Bag";
    if (pid.includes("figure") || pid.includes("collectible")) return "Infinito Hero Metallic Collectible Figure";
    if (pid.includes("poster")) return "Cybernetic Universe Metallic Poster";
    if (pid.includes("cap")) return "Infinito Superhero Embroidered Cap";
    if (pid.includes("mug") || pid.includes("acc")) return "INFINITO Emblem Ceramic Matte Mug";
    if (pid.includes("comic")) return "The Chronicles of Infinito: Issue #1 Collector Edition";
    if (pid.includes("box") || pid.includes("kit")) return "Infinito Universe Ultimate Collector Kit";
  }
  const size = String(item.size || item.variant?.size || "").toLowerCase();
  if (size === "standard") {
    return "Infinito Hero Metallic Collectible Figure";
  }
  return "Special Edition Crimson Red T-Shirt";
};
var getOrderItemImage = (item) => {
  if (!item) return "/products/crimson_tshirt.jpg";
  const prod = item.product || {};
  const candidates = [
    item.image,
    item.thumbnail,
    prod.image,
    prod.thumbnail,
    Array.isArray(prod.images) ? typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.url : null,
    Array.isArray(item.images) ? typeof item.images[0] === "string" ? item.images[0] : item.images[0]?.url : null
  ];
  for (const img of candidates) {
    if (img && typeof img === "string") {
      const trimmed = img.trim();
      if (trimmed && !trimmed.toLowerCase().includes("captainmarvel") && !trimmed.startsWith("blob:null")) {
        return trimmed;
      }
    }
  }
  const pid = String(item.productId || prod.id || prod._id || prod.slug || item.id || "").toLowerCase();
  if (pid) {
    const match = KNOWN_PRODUCTS_CATALOG.find((p) => p.ids.some((id) => id.toLowerCase() === pid));
    if (match) return match.image;
    if (pid.includes("hoodie")) return "/products/white_hoodie.jpg";
    if (pid.includes("tote")) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
    if (pid.includes("figure") || pid.includes("collectible")) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
    if (pid.includes("poster")) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80";
    if (pid.includes("cap")) return "/products/category_caps.jpg";
    if (pid.includes("acc") || pid.includes("mug")) return "/products/category_accessories.jpg";
    if (pid.includes("box") || pid.includes("kit")) return "/products/ultimate_kit_box.jpg";
    if (pid.includes("comic")) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  }
  const itemName = (item.name || prod.name || prod.title || "").toLowerCase();
  if (itemName.includes("hoodie")) return "/products/white_hoodie.jpg";
  if (itemName.includes("tote")) return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes("figure") || itemName.includes("collectible") || itemName.includes("comic")) return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes("poster")) return "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80";
  if (itemName.includes("cap")) return "/products/category_caps.jpg";
  if (itemName.includes("mug") || itemName.includes("keychain")) return "/products/category_accessories.jpg";
  const size = String(item.size || item.variant?.size || "").toLowerCase();
  if (size === "standard") {
    return "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80";
  }
  return "/products/crimson_tshirt.jpg";
};
var formatOrderDate = (baseDate = /* @__PURE__ */ new Date(), daysToAdd = 0) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysToAdd);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};
var generateOrderCode = () => {
  const now = /* @__PURE__ */ new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INF-${yy}${mm}${dd}-${rand}`;
};
var createOrder = ({ items = [], address = null, paymentMethod = "UPI", coupon = null, discount = 0 }) => {
  const orderNumber = generateOrderCode();
  const orderId = `#${orderNumber}`;
  const now = /* @__PURE__ */ new Date();
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
    const itemSku = item.sku || prod.sku || `INF-${name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5).toUpperCase()}-${item.size || "M"}`;
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      name,
      sku: itemSku,
      thumbnail: image,
      image,
      total: price * qty,
      product: {
        ...prod,
        name,
        title: name,
        price,
        image,
        sku: itemSku
      }
    };
  });
  const subtotal = cleanItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Number((subtotal * 0.18).toFixed(2));
  const discountAmount = Number(discount || coupon?.discount || coupon?.discountAmount || 0);
  const total = Number(Math.max(0, subtotal + tax - discountAmount).toFixed(2));
  const cancellationFee = 199;
  const refundAmount = Number(Math.max(0, total - cancellationFee).toFixed(2));
  const loggedInName = getLoggedInUserName();
  let customerInfo = {
    name: loggedInName,
    email: "customer@infinitohq.com",
    phone: "+91 98765 43210"
  };
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const u = JSON.parse(userRaw);
      const uEmail = (u.email || customerInfo.email).toLowerCase().trim();
      const uName = (u.name || u.username || u.fullName || "").trim();
      let resolvedName = loggedInName;
      if (uEmail === "admin@infinitohq.com") {
        resolvedName = "Super Admin";
      } else if (uName && uName.toLowerCase() !== "valued customer" && uName.toLowerCase() !== "aarav sharma") {
        resolvedName = uName;
      } else if (uEmail) {
        resolvedName = deriveNameFromEmail(uEmail);
      }
      customerInfo = {
        name: resolvedName,
        email: uEmail,
        phone: sanitizePhoneNumber(u.phone) || customerInfo.phone
      };
    }
  } catch {
  }
  const activeAddr = address || getDeliveryAddress();
  if (activeAddr.name && activeAddr.name.trim() && activeAddr.name.toLowerCase() !== "valued customer" && activeAddr.name.toLowerCase() !== "aarav sharma") {
    if (customerInfo.email !== "admin@infinitohq.com") {
      customerInfo.name = activeAddr.name.trim();
    }
  }
  if (!customerInfo.name || customerInfo.name.toLowerCase() === "aarav sharma") {
    customerInfo.name = customerInfo.email === "admin@infinitohq.com" ? "Super Admin" : deriveNameFromEmail(customerInfo.email) || "Customer";
  }
  const cleanPhone = sanitizePhoneNumber(activeAddr.phone || customerInfo.phone) || "9876543210";
  const cleanPin = sanitizePinCode(activeAddr.pincode) || "160018";
  customerInfo.phone = cleanPhone;
  const sanitizedAddr = {
    ...activeAddr,
    name: customerInfo.name,
    phone: cleanPhone,
    pincode: cleanPin,
    country: activeAddr.country || "India",
    formatted: activeAddr.formatted || `${activeAddr.line1 || ""}
${activeAddr.city || ""}, ${activeAddr.state || ""}
${cleanPin}, ${activeAddr.country || "India"}`.trim()
  };
  const isCOD = String(paymentMethod || "").toUpperCase() === "COD" || String(paymentMethod || "").toLowerCase().includes("cash on delivery");
  const newOrder = {
    orderId,
    id: orderNumber.toString(),
    createdAt: now.toISOString(),
    customer: customerInfo,
    items: cleanItems,
    address: sanitizedAddr,
    paymentMethod,
    payment: {
      method: isCOD ? "Cash on Delivery (COD)" : paymentMethod,
      status: isCOD ? "COD" : "Paid",
      date: now.toISOString()
    },
    subtotal,
    taxPercent: 18,
    discount: discountAmount,
    coupon: coupon ? {
      code: coupon.code,
      discount: discountAmount,
      type: coupon.type,
      title: coupon.title
    } : null,
    total,
    pricing: {
      subtotal,
      tax,
      discount: discountAmount,
      discountCode: coupon?.code || "",
      shipping: 0,
      grandTotal: total
    },
    cancellationFee,
    refundAmount,
    status: isCOD ? "Order Placed" : "Processing",
    fulfillment: {
      status: isCOD ? "Unfulfilled" : "Processing",
      qikink: {
        sent: !isCOD,
        sentAt: !isCOD ? now.toISOString() : null,
        qikinkOrderId: !isCOD ? `QIK-${orderNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}` : null,
        status: !isCOD ? "In Production" : "Pending Dispatch"
      },
      tracking: {
        carrier: "BlueDart Express",
        trackingNumber: "",
        trackingUrl: "",
        estimatedDelivery: deliveredDate
      }
    },
    timeline: {
      placedDate,
      sentToQikink: isCOD ? null : placedDate,
      dispatchedDate,
      outForDeliveryDate,
      deliveredDate
    }
  };
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(newOrder));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("infinito_order_placed", { detail: newOrder }));
    try {
      if (typeof window !== "undefined" && window.BroadcastChannel) {
        const bus = new BroadcastChannel("infinito_orders_bus");
        bus.postMessage({ type: "infinito_orders_sync", orders: list });
      }
    } catch {
    }
  } catch (e) {
    console.error("Failed to store order:", e);
  }
  try {
    axios.post(`${BASE_URL}/shop/orders`, newOrder).catch(() => {
    });
    axios.post("http://localhost:5000/shop/orders", newOrder).catch(() => {
    });
  } catch {
  }
  return newOrder;
};

// Shop/src/services/couponService.js
var DEFAULT_COUPONS = [
  {
    code: "INFINT10",
    title: "10% OFF Storewide",
    description: "Get 10% instant discount on all merchandise & comics.",
    type: "Percentage",
    value: 10,
    minPurchase: 0,
    badge: "POPULAR"
  },
  {
    code: "WELCOME150",
    title: "Flat \u20B9150 OFF",
    description: "Flat \u20B9150 discount on your order above \u20B9799.",
    type: "Fixed",
    value: 150,
    minPurchase: 799,
    badge: "FIRST ORDER"
  },
  {
    code: "CRIMSON35",
    title: "35% Collector Drop",
    description: "Huge 35% discount on collector drops above \u20B9499.",
    type: "Percentage",
    value: 35,
    minPurchase: 499,
    badge: "SPECIAL DROP"
  },
  {
    code: "FREESHIP",
    title: "Free Express Shipping",
    description: "Flat \u20B950 shipping fee waiver on orders above \u20B9999.",
    type: "Fixed",
    value: 50,
    minPurchase: 999,
    badge: "FREE DELIVERY"
  },
  {
    code: "SUPERHERO20",
    title: "20% Fan Club Special",
    description: "20% off on premium apparel and figurines above \u20B91,199.",
    type: "Percentage",
    value: 20,
    minPurchase: 1199,
    badge: "MEMBERS"
  }
];
var getAvailableCoupons = () => {
  const couponsMap = /* @__PURE__ */ new Map();
  DEFAULT_COUPONS.forEach((c) => couponsMap.set(c.code.toUpperCase(), c));
  try {
    const adminRaw = localStorage.getItem("infinito_discount_codes");
    if (adminRaw) {
      const adminDiscounts = JSON.parse(adminRaw);
      if (Array.isArray(adminDiscounts)) {
        adminDiscounts.forEach((ad) => {
          if (ad.code && ad.status === "Active") {
            const codeUpper = ad.code.toUpperCase().trim();
            const isPct = String(ad.type).toLowerCase().includes("percent");
            couponsMap.set(codeUpper, {
              code: codeUpper,
              title: `${ad.value}${isPct ? "%" : "\u20B9"} OFF`,
              description: ad.appliesToDetail || `Discount for ${codeUpper}`,
              type: isPct ? "Percentage" : "Fixed",
              value: Number(ad.value) || 10,
              minPurchase: Number(ad.minPurchase) || 0,
              badge: "ADMIN OFFER"
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("Could not read admin discounts from storage:", e);
  }
  return Array.from(couponsMap.values());
};
var validateCoupon = (couponCode, subtotal) => {
  const cleanCode = String(couponCode || "").toUpperCase().trim();
  if (!cleanCode) {
    return { valid: false, message: "Please enter a coupon code" };
  }
  const allCoupons = getAvailableCoupons();
  const found = allCoupons.find((c) => c.code === cleanCode);
  if (!found) {
    return { valid: false, message: `Coupon code "${cleanCode}" is invalid or expired` };
  }
  const numSubtotal = Number(subtotal) || 0;
  if (found.minPurchase && numSubtotal < found.minPurchase) {
    return {
      valid: false,
      message: `Minimum order of \u20B9${found.minPurchase.toFixed(2)} required for ${cleanCode} (Cart is \u20B9${numSubtotal.toFixed(2)})`,
      shortfall: found.minPurchase - numSubtotal
    };
  }
  let discountAmount = 0;
  if (found.type === "Percentage") {
    discountAmount = numSubtotal * found.value / 100;
  } else {
    discountAmount = Math.min(found.value, numSubtotal);
  }
  discountAmount = Number(discountAmount.toFixed(2));
  return {
    valid: true,
    coupon: found,
    discountAmount,
    message: `Coupon "${cleanCode}" applied! You saved \u20B9${discountAmount.toFixed(2)}`
  };
};

// Shop/node_modules/redux/dist/redux.mjs
var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
function isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}

// Shop/node_modules/immer/dist/immer.mjs
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
var errors = true ? [
  // All error codes, starting by 0:
  function(plugin) {
    return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
  },
  function(thing) {
    return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
  },
  "This object has been frozen and should not be mutated",
  function(data) {
    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
  },
  "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
  "Immer forbids circular references",
  "The first or second argument to `produce` must be a function",
  "The third argument to `produce` must be a function or undefined",
  "First argument to `createDraft` must be a plain object, an array, or an immerable object",
  "First argument to `finishDraft` must be a draft returned by `createDraft`",
  function(thing) {
    return `'current' expects a draft, got: ${thing}`;
  },
  "Object.defineProperty() cannot be used on an Immer draft",
  "Object.setPrototypeOf() cannot be used on an Immer draft",
  "Immer only supports deleting array indices",
  "Immer only supports setting array indices and the 'length' property",
  function(thing) {
    return `'original' expects a draft, got: ${thing}`;
  }
  // Note: if more errors are added, the errorOffset in Patches.ts should be increased
  // See Patches.ts for additional errors
] : [];
function die(error, ...args) {
  if (true) {
    const e = errors[error];
    const msg = isFunction(e) ? e.apply(null, args) : e;
    throw new Error(`[Immer] ${msg}`);
  }
  throw new Error(
    `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
  );
}
var O = Object;
var getPrototypeOf = O.getPrototypeOf;
var CONSTRUCTOR = "constructor";
var PROTOTYPE = "prototype";
var CONFIGURABLE = "configurable";
var ENUMERABLE = "enumerable";
var WRITABLE = "writable";
var VALUE = "value";
var isDraft = (value) => !!value && !!value[DRAFT_STATE];
function isDraftable(value) {
  if (!value)
    return false;
  return isPlainObject2(value) || isArray(value) || !!value[DRAFTABLE] || !!value[CONSTRUCTOR]?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = O[PROTOTYPE][CONSTRUCTOR].toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject2(value) {
  if (!value || !isObjectish(value))
    return false;
  const proto = getPrototypeOf(value);
  if (proto === null || proto === O[PROTOTYPE])
    return true;
  const Ctor = O.hasOwnProperty.call(proto, CONSTRUCTOR) && proto[CONSTRUCTOR];
  if (Ctor === Object)
    return true;
  if (!isFunction(Ctor))
    return false;
  let ctorString = cachedCtorStrings.get(Ctor);
  if (ctorString === void 0) {
    ctorString = Function.toString.call(Ctor);
    cachedCtorStrings.set(Ctor, ctorString);
  }
  return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
  if (getArchtype(obj) === 0) {
    const keys = strict ? Reflect.ownKeys(obj) : O.keys(obj);
    keys.forEach((key) => {
      iter(key, obj[key], obj);
    });
  } else {
    obj.forEach((entry, index) => iter(index, entry, obj));
  }
}
function getArchtype(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
var has = (thing, prop, type = getArchtype(thing)) => type === 2 ? thing.has(prop) : O[PROTOTYPE].hasOwnProperty.call(thing, prop);
var get = (thing, prop, type = getArchtype(thing)) => (
  // @ts-ignore
  type === 2 ? thing.get(prop) : thing[prop]
);
var set = (thing, propOrOldValue, value, type = getArchtype(thing)) => {
  if (type === 2)
    thing.set(propOrOldValue, value);
  else if (type === 3) {
    thing.add(value);
  } else
    thing[propOrOldValue] = value;
};
function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
var isArray = Array.isArray;
var isMap = (target) => target instanceof Map;
var isSet = (target) => target instanceof Set;
var isObjectish = (target) => typeof target === "object";
var isFunction = (target) => typeof target === "function";
var isBoolean = (target) => typeof target === "boolean";
function isArrayIndex(value) {
  const n = +value;
  return Number.isInteger(n) && String(n) === value;
}
var latest = (state) => state.copy_ || state.base_;
var getFinalValue = (state) => state.modified_ ? state.copy_ : state.base_;
function shallowCopy(base, strict) {
  if (isMap(base)) {
    return new Map(base);
  }
  if (isSet(base)) {
    return new Set(base);
  }
  if (isArray(base))
    return Array[PROTOTYPE].slice.call(base);
  const isPlain = isPlainObject2(base);
  if (strict === true || strict === "class_only" && !isPlain) {
    const descriptors = O.getOwnPropertyDescriptors(base);
    delete descriptors[DRAFT_STATE];
    let keys = Reflect.ownKeys(descriptors);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const desc = descriptors[key];
      if (desc[WRITABLE] === false) {
        desc[WRITABLE] = true;
        desc[CONFIGURABLE] = true;
      }
      if (desc.get || desc.set)
        descriptors[key] = {
          [CONFIGURABLE]: true,
          [WRITABLE]: true,
          // could live with !!desc.set as well here...
          [ENUMERABLE]: desc[ENUMERABLE],
          [VALUE]: base[key]
        };
    }
    return O.create(getPrototypeOf(base), descriptors);
  } else {
    const proto = getPrototypeOf(base);
    if (proto !== null && isPlain) {
      return { ...base };
    }
    const obj = O.create(proto);
    return O.assign(obj, base);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    O.defineProperties(obj, {
      set: dontMutateMethodOverride,
      add: dontMutateMethodOverride,
      clear: dontMutateMethodOverride,
      delete: dontMutateMethodOverride
    });
  }
  O.freeze(obj);
  if (deep)
    each(
      obj,
      (_key, value) => {
        freeze(value, true);
      },
      false
    );
  return obj;
}
function dontMutateFrozenCollections() {
  die(2);
}
var dontMutateMethodOverride = {
  [VALUE]: dontMutateFrozenCollections
};
function isFrozen(obj) {
  if (obj === null || !isObjectish(obj))
    return true;
  return O.isFrozen(obj);
}
var PluginMapSet = "MapSet";
var PluginPatches = "Patches";
var PluginArrayMethods = "ArrayMethods";
var plugins = {};
function getPlugin(pluginKey) {
  const plugin = plugins[pluginKey];
  if (!plugin) {
    die(0, pluginKey);
  }
  return plugin;
}
var isPluginLoaded = (pluginKey) => !!plugins[pluginKey];
var currentScope;
var getCurrentScope = () => currentScope;
var createScope = (parent_, immer_) => ({
  drafts_: [],
  parent_,
  immer_,
  // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.
  canAutoFreeze_: true,
  unfinalizedDrafts_: 0,
  handledSet_: /* @__PURE__ */ new Set(),
  processedForPatches_: /* @__PURE__ */ new Set(),
  mapSetPlugin_: isPluginLoaded(PluginMapSet) ? getPlugin(PluginMapSet) : void 0,
  arrayMethodsPlugin_: isPluginLoaded(PluginArrayMethods) ? getPlugin(PluginArrayMethods) : void 0
});
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    scope.patchPlugin_ = getPlugin(PluginPatches);
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
var enterScope = (immer2) => currentScope = createScope(currentScope, immer2);
function revokeDraft(draft) {
  const state = draft[DRAFT_STATE];
  if (state.type_ === 0 || state.type_ === 1)
    state.revoke_();
  else
    state.revoked_ = true;
}
function processResult(result, scope) {
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
    }
    const { patchPlugin_ } = scope;
    if (patchPlugin_) {
      patchPlugin_.generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope
      );
    }
  } else {
    result = finalize(scope, baseDraft);
  }
  maybeFreeze(scope, result, true);
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value) {
  if (isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  if (!state) {
    const finalValue = handleValue(value, rootScope.handledSet_, rootScope);
    return finalValue;
  }
  if (!isSameScope(state, rootScope)) {
    return value;
  }
  if (!state.modified_) {
    return state.base_;
  }
  if (!state.finalized_) {
    const { callbacks_ } = state;
    if (callbacks_) {
      while (callbacks_.length > 0) {
        const callback = callbacks_.pop();
        callback(rootScope);
      }
    }
    generatePatchesAndFinalize(state, rootScope);
  }
  return state.copy_;
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function markStateFinalized(state) {
  state.finalized_ = true;
  state.scope_.unfinalizedDrafts_--;
}
var isSameScope = (state, rootScope) => state.scope_ === rootScope;
var EMPTY_LOCATIONS_RESULT = [];
function updateDraftInParent(parent, draftValue, finalizedValue, originalKey) {
  const parentCopy = latest(parent);
  const parentType = parent.type_;
  if (originalKey !== void 0) {
    const currentValue = get(parentCopy, originalKey, parentType);
    if (currentValue === draftValue) {
      set(parentCopy, originalKey, finalizedValue, parentType);
      return;
    }
  }
  if (!parent.draftLocations_) {
    const draftLocations = parent.draftLocations_ = /* @__PURE__ */ new Map();
    each(parentCopy, (key, value) => {
      if (isDraft(value)) {
        const keys = draftLocations.get(value) || [];
        keys.push(key);
        draftLocations.set(value, keys);
      }
    });
  }
  const locations = parent.draftLocations_.get(draftValue) ?? EMPTY_LOCATIONS_RESULT;
  for (const location of locations) {
    set(parentCopy, location, finalizedValue, parentType);
  }
}
function registerChildFinalizationCallback(parent, child, key) {
  parent.callbacks_.push(function childCleanup(rootScope) {
    const state = child;
    if (!state || !isSameScope(state, rootScope)) {
      return;
    }
    rootScope.mapSetPlugin_?.fixSetContents(state);
    const finalizedValue = getFinalValue(state);
    updateDraftInParent(parent, state.draft_ ?? state, finalizedValue, key);
    generatePatchesAndFinalize(state, rootScope);
  });
}
function generatePatchesAndFinalize(state, rootScope) {
  const shouldFinalize = state.modified_ && !state.finalized_ && (state.type_ === 3 || state.type_ === 1 && state.allIndicesReassigned_ || (state.assigned_?.size ?? 0) > 0);
  if (shouldFinalize) {
    const { patchPlugin_ } = rootScope;
    if (patchPlugin_) {
      const basePath = patchPlugin_.getPath(state);
      if (basePath) {
        patchPlugin_.generatePatches_(state, basePath, rootScope);
      }
    }
    markStateFinalized(state);
  }
}
function handleCrossReference(target, key, value) {
  const { scope_ } = target;
  if (isDraft(value)) {
    const state = value[DRAFT_STATE];
    if (isSameScope(state, scope_)) {
      state.callbacks_.push(function crossReferenceCleanup() {
        prepareCopy(target);
        const finalizedValue = getFinalValue(state);
        updateDraftInParent(target, value, finalizedValue, key);
      });
    }
  } else if (isDraftable(value)) {
    target.callbacks_.push(function nestedDraftCleanup() {
      const targetCopy = latest(target);
      if (target.type_ === 3) {
        if (targetCopy.has(value)) {
          handleValue(value, scope_.handledSet_, scope_);
        }
      } else {
        if (get(targetCopy, key, target.type_) === value) {
          if (scope_.drafts_.length > 1 && (target.assigned_.get(key) ?? false) === true && target.copy_) {
            handleValue(
              get(target.copy_, key, target.type_),
              scope_.handledSet_,
              scope_
            );
          }
        }
      }
    });
  }
}
function handleValue(target, handledSet, rootScope) {
  if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
    return target;
  }
  if (isDraft(target) || handledSet.has(target) || !isDraftable(target) || isFrozen(target)) {
    return target;
  }
  handledSet.add(target);
  each(target, (key, value) => {
    if (isDraft(value)) {
      const state = value[DRAFT_STATE];
      if (isSameScope(state, rootScope)) {
        const updatedValue = getFinalValue(state);
        set(target, key, updatedValue, target.type_);
        markStateFinalized(state);
      }
    } else if (isDraftable(value)) {
      handleValue(value, handledSet, rootScope);
    }
  });
  return target;
}
function createProxyProxy(base, parent) {
  const baseIsArray = isArray(base);
  const state = {
    type_: baseIsArray ? 1 : 0,
    // Track which produce call this is associated with.
    scope_: parent ? parent.scope_ : getCurrentScope(),
    // True for both shallow and deep changes.
    modified_: false,
    // Used during finalization.
    finalized_: false,
    // Track which properties have been assigned (true) or deleted (false).
    // actually instantiated in `prepareCopy()`
    assigned_: void 0,
    // The parent draft state.
    parent_: parent,
    // The base state.
    base_: base,
    // The base proxy.
    draft_: null,
    // set below
    // The base copy with any updated values.
    copy_: null,
    // Called by the `produce` function.
    revoke_: null,
    isManual_: false,
    // `callbacks` actually gets assigned in `createProxy`
    callbacks_: void 0
  };
  let target = state;
  let traps = objectTraps;
  if (baseIsArray) {
    target = [state];
    traps = arrayTraps;
  }
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return [proxy, state];
}
var objectTraps = {
  get(state, prop) {
    if (prop === DRAFT_STATE)
      return state;
    let arrayPlugin = state.scope_.arrayMethodsPlugin_;
    const isArrayWithStringProp = state.type_ === 1 && typeof prop === "string";
    if (isArrayWithStringProp) {
      if (arrayPlugin?.isArrayOperationMethod(prop)) {
        return arrayPlugin.createMethodInterceptor(state, prop);
      }
    }
    const source = latest(state);
    if (!has(source, prop, state.type_)) {
      return readPropFromProto(state, source, prop);
    }
    const value = source[prop];
    if (state.finalized_ || !isDraftable(value)) {
      return value;
    }
    if (isArrayWithStringProp && state.operationMethod && arrayPlugin?.isMutatingArrayMethod(
      state.operationMethod
    ) && isArrayIndex(prop)) {
      return value;
    }
    if (value === peek(state.base_, prop) || isRelocatedBaseRef(state, prop, value)) {
      prepareCopy(state);
      const childKey = state.type_ === 1 ? +prop : prop;
      const childDraft = createProxy(state.scope_, value, state, childKey);
      return state.copy_[childKey] = childDraft;
    }
    return value;
  },
  has(state, prop) {
    return prop in latest(state);
  },
  ownKeys(state) {
    return Reflect.ownKeys(latest(state));
  },
  set(state, prop, value) {
    const desc = getDescriptorFromProto(latest(state), prop);
    if (desc?.set) {
      desc.set.call(state.draft_, value);
      return true;
    }
    if (!state.modified_) {
      const current2 = peek(latest(state), prop);
      const currentState = current2?.[DRAFT_STATE];
      if (currentState && currentState.base_ === value) {
        state.copy_[prop] = value;
        state.assigned_.set(prop, false);
        return true;
      }
      if (is(value, current2) && (value !== void 0 || has(state.base_, prop, state.type_)))
        return true;
      prepareCopy(state);
      markChanged(state);
    }
    if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
    (value !== void 0 || has(state.copy_, prop, state.type_)) || // special case: NaN
    Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
      return true;
    state.copy_[prop] = value;
    state.assigned_.set(prop, true);
    handleCrossReference(state, prop, value);
    return true;
  },
  deleteProperty(state, prop) {
    prepareCopy(state);
    if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
      state.assigned_.set(prop, false);
      markChanged(state);
    } else {
      state.assigned_.delete(prop);
    }
    if (state.copy_) {
      delete state.copy_[prop];
    }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor(state, prop) {
    const owner = latest(state);
    const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
    if (!desc)
      return desc;
    return {
      [WRITABLE]: true,
      [CONFIGURABLE]: state.type_ !== 1 || prop !== "length",
      [ENUMERABLE]: desc[ENUMERABLE],
      [VALUE]: owner[prop]
    };
  },
  defineProperty() {
    die(11);
  },
  getPrototypeOf(state) {
    return getPrototypeOf(state.base_);
  },
  setPrototypeOf() {
    die(12);
  }
};
var arrayTraps = {};
for (let key in objectTraps) {
  let fn = objectTraps[key];
  arrayTraps[key] = function() {
    const args = arguments;
    args[0] = args[0][0];
    return fn.apply(this, args);
  };
}
arrayTraps.deleteProperty = function(state, prop) {
  if (isNaN(parseInt(prop)))
    die(13);
  return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
  if (prop !== "length" && isNaN(parseInt(prop)))
    die(14);
  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
  const state = draft[DRAFT_STATE];
  const source = state ? latest(state) : draft;
  return source[prop];
}
function isRelocatedBaseRef(state, prop, value) {
  if (state.type_ !== 1 || !state.allIndicesReassigned_ || state.assigned_?.get(prop) || !isDraftable(value) || value[DRAFT_STATE]) {
    return false;
  }
  return state.baseRefs_.has(value);
}
function readPropFromProto(state, source, prop) {
  const desc = getDescriptorFromProto(source, prop);
  return desc ? VALUE in desc ? desc[VALUE] : (
    // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state.draft_)
  ) : void 0;
}
function getDescriptorFromProto(source, prop) {
  if (!(prop in source))
    return void 0;
  let proto = getPrototypeOf(source);
  while (proto) {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (desc)
      return desc;
    proto = getPrototypeOf(proto);
  }
  return void 0;
}
function markChanged(state) {
  if (!state.modified_) {
    state.modified_ = true;
    if (state.parent_) {
      markChanged(state.parent_);
    }
  }
}
function prepareCopy(state) {
  if (!state.copy_) {
    state.assigned_ = /* @__PURE__ */ new Map();
    state.copy_ = shallowCopy(
      state.base_,
      state.scope_.immer_.useStrictShallowCopy_
    );
  }
}
var Immer2 = class {
  constructor(config) {
    this.autoFreeze_ = true;
    this.useStrictShallowCopy_ = false;
    this.useStrictIteration_ = false;
    this.produce = (base, recipe, patchListener) => {
      if (isFunction(base) && !isFunction(recipe)) {
        const defaultBase = recipe;
        recipe = base;
        const self = this;
        return function curriedProduce(base2 = defaultBase, ...args) {
          return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
        };
      }
      if (!isFunction(recipe))
        die(6);
      if (patchListener !== void 0 && !isFunction(patchListener))
        die(7);
      let result;
      if (isDraftable(base)) {
        const scope = enterScope(this);
        const proxy = createProxy(scope, base, void 0);
        let hasError = true;
        try {
          result = recipe(proxy);
          hasError = false;
        } finally {
          if (hasError)
            revokeScope(scope);
          else
            leaveScope(scope);
        }
        usePatchesInScope(scope, patchListener);
        return processResult(result, scope);
      } else if (!base || !isObjectish(base)) {
        result = recipe(base);
        if (result === void 0)
          result = base;
        if (result === NOTHING)
          result = void 0;
        if (this.autoFreeze_)
          freeze(result, true);
        if (patchListener) {
          const p = [];
          const ip = [];
          getPlugin(PluginPatches).generateReplacementPatches_(base, result, {
            patches_: p,
            inversePatches_: ip
          });
          patchListener(p, ip);
        }
        return result;
      } else
        die(1, base);
    };
    this.produceWithPatches = (base, recipe) => {
      if (isFunction(base)) {
        return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
      }
      let patches, inversePatches;
      const result = this.produce(base, recipe, (p, ip) => {
        patches = p;
        inversePatches = ip;
      });
      return [result, patches, inversePatches];
    };
    if (isBoolean(config?.autoFreeze))
      this.setAutoFreeze(config.autoFreeze);
    if (isBoolean(config?.useStrictShallowCopy))
      this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    if (isBoolean(config?.useStrictIteration))
      this.setUseStrictIteration(config.useStrictIteration);
  }
  createDraft(base) {
    if (!isDraftable(base))
      die(8);
    if (isDraft(base))
      base = current(base);
    const scope = enterScope(this);
    const proxy = createProxy(scope, base, void 0);
    proxy[DRAFT_STATE].isManual_ = true;
    leaveScope(scope);
    return proxy;
  }
  finishDraft(draft, patchListener) {
    const state = draft && draft[DRAFT_STATE];
    if (!state || !state.isManual_)
      die(9);
    const { scope_: scope } = state;
    usePatchesInScope(scope, patchListener);
    return processResult(void 0, scope);
  }
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */
  setAutoFreeze(value) {
    this.autoFreeze_ = value;
  }
  /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */
  setUseStrictShallowCopy(value) {
    this.useStrictShallowCopy_ = value;
  }
  /**
   * Pass false to use faster iteration that skips non-enumerable properties
   * but still handles symbols for compatibility.
   *
   * By default, strict iteration is enabled (includes all own properties).
   */
  setUseStrictIteration(value) {
    this.useStrictIteration_ = value;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(base, patches) {
    let i;
    for (i = patches.length - 1; i >= 0; i--) {
      const patch = patches[i];
      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }
    if (i > -1) {
      patches = patches.slice(i + 1);
    }
    const applyPatchesImpl = getPlugin(PluginPatches).applyPatches_;
    if (isDraft(base)) {
      return applyPatchesImpl(base, patches);
    }
    return this.produce(
      base,
      (draft) => applyPatchesImpl(draft, patches)
    );
  }
};
function createProxy(rootScope, value, parent, key) {
  const [draft, state] = isMap(value) ? getPlugin(PluginMapSet).proxyMap_(value, parent) : isSet(value) ? getPlugin(PluginMapSet).proxySet_(value, parent) : createProxyProxy(value, parent);
  const scope = parent?.scope_ ?? getCurrentScope();
  scope.drafts_.push(draft);
  state.callbacks_ = parent?.callbacks_ ?? [];
  state.key_ = key;
  if (parent && key !== void 0) {
    registerChildFinalizationCallback(parent, state, key);
  } else {
    state.callbacks_.push(function rootDraftCleanup(rootScope2) {
      rootScope2.mapSetPlugin_?.fixSetContents(state);
      const { patchPlugin_ } = rootScope2;
      if (state.modified_ && patchPlugin_) {
        patchPlugin_.generatePatches_(state, [], rootScope2);
      }
    });
  }
  return draft;
}
function current(value) {
  if (!isDraft(value))
    die(10, value);
  return currentImpl(value);
}
function currentImpl(value) {
  if (!isDraftable(value) || isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  let copy;
  let strict = true;
  if (state) {
    if (!state.modified_)
      return state.base_;
    state.finalized_ = true;
    copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
    strict = state.scope_.immer_.shouldUseStrictIteration();
  } else {
    copy = shallowCopy(value, true);
  }
  each(
    copy,
    (key, childValue) => {
      set(copy, key, currentImpl(childValue));
    },
    strict
  );
  if (state) {
    state.finalized_ = false;
  }
  return copy;
}
var _globalIterator = globalThis.Iterator;
var hasIteratorFrom = typeof _globalIterator?.from === "function";
var immer = new Immer2();
var produce = immer.produce;

// Shop/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
  if (arguments.length === 0) return void 0;
  if (typeof arguments[0] === "object") return compose;
  return compose.apply(null, arguments);
};
var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function() {
  return function(noop3) {
    return noop3;
  };
};
var hasMatchFunction = (v) => {
  return v && typeof v.match === "function";
};
function createAction(type, prepareAction) {
  function actionCreator(...args) {
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error(false ? formatProdErrorMessage(0) : "prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        ..."meta" in prepared && {
          meta: prepared.meta
        },
        ..."error" in prepared && {
          error: prepared.error
        }
      };
    }
    return {
      type,
      payload: args[0]
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) => isAction(action) && action.type === type;
  return actionCreator;
}
function freezeDraftable(val) {
  return isDraftable(val) ? produce(val, () => {
  }) : val;
}
function getOrInsertComputed(map, key, compute) {
  if (map.has(key)) return map.get(key);
  return map.set(key, compute(key)).get(key);
}
function executeReducerBuilderCallback(builderCallback) {
  const actionsMap = {};
  const actionMatchers = [];
  let defaultCaseReducer;
  const builder = {
    addCase(typeOrActionCreator, reducer) {
      if (true) {
        if (actionMatchers.length > 0) {
          throw new Error(false ? formatProdErrorMessage(26) : "`builder.addCase` should only be called before calling `builder.addMatcher`");
        }
        if (defaultCaseReducer) {
          throw new Error(false ? formatProdErrorMessage(27) : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
        }
      }
      const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (!type) {
        throw new Error(false ? formatProdErrorMessage(28) : "`builder.addCase` cannot be called with an empty action type");
      }
      if (type in actionsMap) {
        throw new Error(false ? formatProdErrorMessage(29) : `\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
      }
      actionsMap[type] = reducer;
      return builder;
    },
    addAsyncThunk(asyncThunk, reducers) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error(false ? formatProdErrorMessage(43) : "`builder.addAsyncThunk` should only be called before calling `builder.addDefaultCase`");
        }
      }
      if (reducers.pending) actionsMap[asyncThunk.pending.type] = reducers.pending;
      if (reducers.rejected) actionsMap[asyncThunk.rejected.type] = reducers.rejected;
      if (reducers.fulfilled) actionsMap[asyncThunk.fulfilled.type] = reducers.fulfilled;
      if (reducers.settled) actionMatchers.push({
        matcher: asyncThunk.settled,
        reducer: reducers.settled
      });
      return builder;
    },
    addMatcher(matcher, reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error(false ? formatProdErrorMessage(30) : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
        }
      }
      actionMatchers.push({
        matcher,
        reducer
      });
      return builder;
    },
    addDefaultCase(reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error(false ? formatProdErrorMessage(31) : "`builder.addDefaultCase` can only be called once");
        }
      }
      defaultCaseReducer = reducer;
      return builder;
    }
  };
  builderCallback(builder);
  return [actionsMap, actionMatchers, defaultCaseReducer];
}
function isStateFunction(x) {
  return typeof x === "function";
}
function createReducer(initialState, mapOrBuilderCallback) {
  if (true) {
    if (typeof mapOrBuilderCallback === "object") {
      throw new Error(false ? formatProdErrorMessage(8) : "The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
    }
  }
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
  let getInitialState;
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }
  function reducer(state = getInitialState(), action) {
    let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
      matcher
    }) => matcher(action)).map(({
      reducer: reducer2
    }) => reducer2)];
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce((previousState, caseReducer) => {
      if (caseReducer) {
        if (isDraft(previousState)) {
          const draft = previousState;
          const result = caseReducer(draft, action);
          if (result === void 0) {
            return previousState;
          }
          return result;
        } else if (!isDraftable(previousState)) {
          const result = caseReducer(previousState, action);
          if (result === void 0) {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return produce(previousState, (draft) => {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;
  return reducer;
}
var matches = (matcher, action) => {
  if (hasMatchFunction(matcher)) {
    return matcher.match(action);
  } else {
    return matcher(action);
  }
};
function isAnyOf(...matchers) {
  return (action) => {
    return matchers.some((matcher) => matches(matcher, action));
  };
}
var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
var commonProperties = ["name", "message", "stack", "code"];
var RejectWithValue = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  payload;
  meta;
  /*
  type-only property to distinguish between RejectWithValue and FulfillWithMeta
  does not exist at runtime
  */
  _type;
};
var FulfillWithMeta = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  payload;
  meta;
  /*
  type-only property to distinguish between RejectWithValue and FulfillWithMeta
  does not exist at runtime
  */
  _type;
};
var miniSerializeError = (value) => {
  if (typeof value === "object" && value !== null) {
    const simpleError = {};
    for (const property of commonProperties) {
      if (typeof value[property] === "string") {
        simpleError[property] = value[property];
      }
    }
    return simpleError;
  }
  return {
    message: String(value)
  };
};
var externalAbortMessage = "External signal was aborted";
var createAsyncThunk = /* @__PURE__ */ (() => {
  function createAsyncThunk2(typePrefix, payloadCreator, options) {
    const fulfilled = createAction(typePrefix + "/fulfilled", (payload, requestId, arg, meta) => ({
      payload,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "fulfilled"
      }
    }));
    const pending = createAction(typePrefix + "/pending", (requestId, arg, meta) => ({
      payload: void 0,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "pending"
      }
    }));
    const rejected = createAction(typePrefix + "/rejected", (error, requestId, arg, payload, meta) => ({
      payload,
      error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
      meta: {
        ...meta || {},
        arg,
        requestId,
        rejectedWithValue: !!payload,
        requestStatus: "rejected",
        aborted: error?.name === "AbortError",
        condition: error?.name === "ConditionError"
      }
    }));
    function actionCreator(arg, {
      signal
    } = {}) {
      return (dispatch, getState, extra) => {
        const requestId = options?.idGenerator ? options.idGenerator(arg) : nanoid();
        const abortController = new AbortController();
        let abortHandler;
        let abortReason;
        function abort(reason) {
          abortReason = reason;
          abortController.abort();
        }
        if (signal) {
          if (signal.aborted) {
            abort(externalAbortMessage);
          } else {
            signal.addEventListener("abort", () => abort(externalAbortMessage), {
              once: true
            });
          }
        }
        const promise = (async function() {
          let finalAction;
          try {
            let conditionResult = options?.condition?.(arg, {
              getState,
              extra
            });
            if (isThenable(conditionResult)) {
              conditionResult = await conditionResult;
            }
            if (conditionResult === false || abortController.signal.aborted) {
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            }
            const abortedPromise = new Promise((_, reject) => {
              abortHandler = () => {
                reject({
                  name: "AbortError",
                  message: abortReason || "Aborted"
                });
              };
              abortController.signal.addEventListener("abort", abortHandler, {
                once: true
              });
            });
            dispatch(pending(requestId, arg, options?.getPendingMeta?.({
              requestId,
              arg
            }, {
              getState,
              extra
            })));
            finalAction = await Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
              dispatch,
              getState,
              extra,
              requestId,
              signal: abortController.signal,
              abort,
              rejectWithValue: ((value, meta) => {
                return new RejectWithValue(value, meta);
              }),
              fulfillWithValue: ((value, meta) => {
                return new FulfillWithMeta(value, meta);
              })
            })).then((result) => {
              if (result instanceof RejectWithValue) {
                throw result;
              }
              if (result instanceof FulfillWithMeta) {
                return fulfilled(result.payload, requestId, arg, result.meta);
              }
              return fulfilled(result, requestId, arg);
            })]);
          } catch (err) {
            finalAction = err instanceof RejectWithValue ? rejected(null, requestId, arg, err.payload, err.meta) : rejected(err, requestId, arg);
          } finally {
            if (abortHandler) {
              abortController.signal.removeEventListener("abort", abortHandler);
            }
          }
          const skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
          if (!skipDispatch) {
            dispatch(finalAction);
          }
          return finalAction;
        })();
        return Object.assign(promise, {
          abort,
          requestId,
          arg,
          unwrap() {
            return promise.then(unwrapResult);
          }
        });
      };
    }
    return Object.assign(actionCreator, {
      pending,
      rejected,
      fulfilled,
      settled: isAnyOf(rejected, fulfilled),
      typePrefix
    });
  }
  createAsyncThunk2.withTypes = () => createAsyncThunk2;
  return createAsyncThunk2;
})();
function unwrapResult(action) {
  if (action.meta && action.meta.rejectedWithValue) {
    throw action.payload;
  }
  if (action.error) {
    throw action.error;
  }
  return action.payload;
}
function isThenable(value) {
  return value !== null && typeof value === "object" && typeof value.then === "function";
}
var asyncThunkSymbol = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
var asyncThunkCreator = {
  [asyncThunkSymbol]: createAsyncThunk
};
function getType(slice, actionKey) {
  return `${slice}/${actionKey}`;
}
function buildCreateSlice({
  creators
} = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    const {
      name,
      reducerPath = name
    } = options;
    if (!name) {
      throw new Error(false ? formatProdErrorMessage(11) : "`name` is a required option for createSlice");
    }
    if (typeof process !== "undefined" && true) {
      if (options.initialState === void 0) {
        console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
      }
    }
    const reducers = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    };
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error(false ? formatProdErrorMessage(12) : "`context.addCase` cannot be called with an empty action type");
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error(false ? formatProdErrorMessage(13) : "`context.addCase` cannot be called with two reducers for the same action type: " + type);
        }
        context.sliceCaseReducersByType[type] = reducer2;
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      }
    };
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];
      const reducerDetails = {
        reducerName,
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function"
      };
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
      } else {
        handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
      }
    });
    function buildReducer() {
      if (true) {
        if (typeof options.extraReducers === "object") {
          throw new Error(false ? formatProdErrorMessage(14) : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
        }
      }
      const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = void 0] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType
      };
      return createReducer(options.initialState, (builder) => {
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }
    const selectSelf = (state) => state;
    const injectedSelectorCache = /* @__PURE__ */ new Map();
    const injectedStateCache = /* @__PURE__ */ new WeakMap();
    let _reducer;
    function reducer(state, action) {
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getOrInsertComputed(injectedStateCache, selectSlice, getInitialState);
          } else if (true) {
            throw new Error(false ? formatProdErrorMessage(15) : "selectSlice returned undefined for an uninjected slice reducer");
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = getOrInsertComputed(injectedSelectorCache, injected, () => /* @__PURE__ */ new WeakMap());
        return getOrInsertComputed(selectorCache, selectState, () => {
          const map = {};
          for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
            map[name2] = wrapSelector(selector, selectState, () => getOrInsertComputed(injectedStateCache, selectState, getInitialState), injected);
          }
          return map;
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice
      };
    }
    const slice = {
      name,
      reducer,
      actions: context.actionCreators,
      caseReducers: context.sliceCaseReducersByName,
      getInitialState,
      ...makeSelectorProps(reducerPath),
      injectInto(injectable, {
        reducerPath: pathOpt,
        ...config
      } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject({
          reducerPath: newReducerPath,
          reducer
        }, config);
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true)
        };
      }
    };
    return slice;
  };
}
function wrapSelector(selector, selectState, getInitialState, injected) {
  function wrapper(rootState, ...args) {
    let sliceState = selectState(rootState);
    if (typeof sliceState === "undefined") {
      if (injected) {
        sliceState = getInitialState();
      } else if (true) {
        throw new Error(false ? formatProdErrorMessage(16) : "selectState returned undefined for an uninjected slice reducer");
      }
    }
    return selector(sliceState, ...args);
  }
  wrapper.unwrapped = selector;
  return wrapper;
}
var createSlice = /* @__PURE__ */ buildCreateSlice();
function buildReducerCreators() {
  function asyncThunk(payloadCreator, config) {
    return {
      _reducerDefinitionType: "asyncThunk",
      payloadCreator,
      ...config
    };
  }
  asyncThunk.withTypes = () => asyncThunk;
  return {
    reducer(caseReducer) {
      return Object.assign({
        // hack so the wrapping function has the same name as the original
        // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
        [caseReducer.name](...args) {
          return caseReducer(...args);
        }
      }[caseReducer.name], {
        _reducerDefinitionType: "reducer"
        /* reducer */
      });
    },
    preparedReducer(prepare, reducer) {
      return {
        _reducerDefinitionType: "reducerWithPrepare",
        prepare,
        reducer
      };
    },
    asyncThunk
  };
}
function handleNormalReducerDefinition({
  type,
  reducerName,
  createNotation
}, maybeReducerWithPrepare, context) {
  let caseReducer;
  let prepareCallback;
  if ("reducer" in maybeReducerWithPrepare) {
    if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
      throw new Error(false ? formatProdErrorMessage(17) : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    caseReducer = maybeReducerWithPrepare;
  }
  context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
}
function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk";
}
function isCaseReducerWithPrepareDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "reducerWithPrepare";
}
function handleThunkCaseReducerDefinition({
  type,
  reducerName
}, reducerDefinition, context, cAT) {
  if (!cAT) {
    throw new Error(false ? formatProdErrorMessage(18) : "Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
  }
  const {
    payloadCreator,
    fulfilled,
    pending,
    rejected,
    settled,
    options
  } = reducerDefinition;
  const thunk = cAT(type, payloadCreator, options);
  context.exposeAction(reducerName, thunk);
  if (fulfilled) {
    context.addCase(thunk.fulfilled, fulfilled);
  }
  if (pending) {
    context.addCase(thunk.pending, pending);
  }
  if (rejected) {
    context.addCase(thunk.rejected, rejected);
  }
  if (settled) {
    context.addMatcher(thunk.settled, settled);
  }
  context.exposeCaseReducer(reducerName, {
    fulfilled: fulfilled || noop,
    pending: pending || noop,
    rejected: rejected || noop,
    settled: settled || noop
  });
}
function noop() {
}
var listener = "listener";
var completed = "completed";
var cancelled = "cancelled";
var taskCancelled = `task-${cancelled}`;
var taskCompleted = `task-${completed}`;
var listenerCancelled = `${listener}-${cancelled}`;
var listenerCompleted = `${listener}-${completed}`;
var {
  assign
} = Object;
var alm = "listenerMiddleware";
var addListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/add`), {
  withTypes: () => addListener
});
var clearAllListeners = /* @__PURE__ */ createAction(`${alm}/removeAll`);
var removeListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/remove`), {
  withTypes: () => removeListener
});

// Shop/src/redux/cartSlice.js
var CART_KEY = "shop_cart";
var loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
var saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
  }
};
var cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCart()
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId, size, quantity = 1, product } = action.payload;
      const existing = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ productId, size, quantity, product });
      }
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart(state.items);
      }
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (i) => !(i.productId === productId && i.size === size)
      );
      saveCart(state.items);
    },
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      saveCart(state.items);
    },
    updateSize: (state, action) => {
      const { productId, oldSize, newSize } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === oldSize
      );
      if (item) {
        const existing = state.items.find(
          (i) => i.productId === productId && i.size === newSize && i !== item
        );
        if (existing) {
          existing.quantity += item.quantity;
          state.items = state.items.filter((i) => i !== item);
        } else {
          item.size = newSize;
        }
        saveCart(state.items);
      }
    }
  }
});
var {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCart,
  updateSize
} = cartSlice.actions;
var cartSlice_default = cartSlice.reducer;

// Shop/src/pages/Checkout/Checkout.jsx
var Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState("cart");
  const [address, setAddress] = useState(getDeliveryAddress());
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: address.name && address.name.toLowerCase() !== "aarav sharma" ? address.name : getLoggedInUserName(),
    phone: address.phone ? String(address.phone).replace(/\D/g, "").slice(-10) : "9876543210",
    line1: address.line1 || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    country: address.country || "India"
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponList, setShowCouponList] = useState(false);
  useEffect(() => {
    try {
      const mode = localStorage.getItem("checkout_mode") || "cart";
      setCheckoutMode(mode);
      const saved = localStorage.getItem("checkout_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCheckoutItems(parsed);
          return;
        }
      }
      const cartRaw = localStorage.getItem("shop_cart");
      if (cartRaw) {
        const parsedCart = JSON.parse(cartRaw);
        setCheckoutItems(parsedCart);
      }
    } catch (e) {
      console.error("Failed to load checkout items:", e);
    }
  }, []);
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = Number(item.product?.price || item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [checkoutItems]);
  const authUser = useSelector((state) => state.user?.user) || (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const isUltimateMember = useMemo(() => {
    return Boolean(
      authUser?.hasInfinitoUltimate || authUser?.isUltimateMember || authUser?.membershipType === "ULTIMATE" || authUser?.plan === "ULTIMATE" || localStorage.getItem("is_ultimate_member") === "true"
    );
  }, [authUser]);
  const taxAmount = useMemo(() => {
    return Number((subtotal * 0.18).toFixed(2));
  }, [subtotal]);
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "Percentage") {
      return Number((subtotal * appliedCoupon.value / 100).toFixed(2));
    }
    return Number(Math.min(appliedCoupon.value, subtotal).toFixed(2));
  }, [appliedCoupon, subtotal]);
  const ultimateDiscountAmount = useMemo(() => {
    if (!isUltimateMember) return 0;
    return Number((subtotal * 0.1).toFixed(2));
  }, [isUltimateMember, subtotal]);
  const totalDiscountAmount = useMemo(() => {
    return Number((discountAmount + ultimateDiscountAmount).toFixed(2));
  }, [discountAmount, ultimateDiscountAmount]);
  const grandTotal = useMemo(() => {
    return Math.max(0, Number((subtotal + taxAmount - totalDiscountAmount).toFixed(2)));
  }, [subtotal, taxAmount, totalDiscountAmount]);
  const availableCoupons = useMemo(() => getAvailableCoupons(), []);
  const handleApplyCoupon = (codeToApply) => {
    const targetCode = String(codeToApply || couponCodeInput).trim().toUpperCase();
    if (!targetCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    const res = validateCoupon(targetCode, subtotal);
    if (!res.valid) {
      toast.error(res.message);
      return;
    }
    setAppliedCoupon({
      ...res.coupon,
      discountAmount: res.discountAmount
    });
    setCouponCodeInput(res.coupon.code);
    toast.success(res.message);
  };
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    toast("Coupon removed");
  };
  const handleSaveAddress = (e) => {
    e.preventDefault();
    const cleanPhone = String(addressForm.phone || "").replace(/\D/g, "").slice(-10);
    const cleanPin = String(addressForm.pincode || "").replace(/\D/g, "").slice(0, 6);
    if (!addressForm.name || !addressForm.name.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!addressForm.line1 || !addressForm.line1.trim()) {
      toast.error("Please enter street address / house number");
      return;
    }
    if (!addressForm.city || !addressForm.city.trim()) {
      toast.error("Please enter city");
      return;
    }
    if (!addressForm.state || !addressForm.state.trim()) {
      toast.error("Please enter state");
      return;
    }
    if (cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }
    const updated = saveDeliveryAddress({
      ...addressForm,
      name: addressForm.name.trim(),
      phone: cleanPhone,
      pincode: cleanPin
    });
    setAddress(updated);
    setIsEditingAddress(false);
    toast.success("Delivery address updated successfully");
  };
  const handleProceedPayment = () => {
    if (checkoutItems.length === 0) {
      toast("No items to checkout");
      return;
    }
    setShowPaymentModal(true);
  };
  const handleCompletePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const order = createOrder({
        items: checkoutItems,
        address,
        paymentMethod: selectedPayment.toUpperCase(),
        coupon: appliedCoupon,
        discount: totalDiscountAmount,
        isUltimateMember,
        ultimateDiscount: ultimateDiscountAmount
      });
      if (checkoutMode === "cart") {
        dispatch(clearCart());
      } else {
        checkoutItems.forEach((it) => {
          dispatch(removeFromCart({ productId: it.productId, size: it.size }));
        });
      }
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      navigate(`/order-success/${order.id}`);
    }, 800);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white min-h-screen text-black font-sans pb-24" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-[1200px] mx-auto px-4 md:px-12 pt-8" }, isUltimateMember && /* @__PURE__ */ React.createElement("div", { className: "mb-8 p-4 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border-2 border-amber-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl" }, "\u{1F451}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-black text-xs sm:text-sm uppercase tracking-wider text-amber-900 flex items-center gap-1.5" }, "Infinito Ultimate Member Privilege Active", /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 bg-amber-500 text-black font-extrabold text-[10px] rounded" }, "VIP SUBSCRIBER")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-700 mt-0.5" }, "10% Automatic Subscriber Discount + Free Priority Express Shipping have been applied to your checkout."))), /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-amber-800 text-xs sm:text-sm bg-white/80 border border-amber-300 px-3 py-1 rounded" }, "-\u20B9", ultimateDiscountAmount.toFixed(2), " OFF")), /* @__PURE__ */ React.createElement("div", { className: "mb-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("h1", { className: "text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans" }, "Deliver At This Address"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setAddressForm({
          name: address.name && address.name.toLowerCase() !== "aarav sharma" ? address.name : getLoggedInUserName(),
          phone: address.phone ? String(address.phone).replace(/\D/g, "").slice(-10) : "9876543210",
          line1: address.line1 || "",
          city: address.city || "",
          state: address.state || "",
          pincode: address.pincode || "",
          country: address.country || "India"
        });
        setIsEditingAddress(true);
      },
      className: "flex items-center gap-1.5 px-4 py-1.5 border border-black hover:bg-black hover:text-white transition text-xs md:text-sm font-bold tracking-wide cursor-pointer shadow-sm"
    },
    /* @__PURE__ */ React.createElement("span", null, "Edit"),
    /* @__PURE__ */ React.createElement(Edit2, { className: "w-3.5 h-3.5" })
  )), /* @__PURE__ */ React.createElement("div", { className: "border border-black p-5 md:p-6 bg-white min-h-[100px] flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-base md:text-lg font-bold text-black font-dmsans" }, address.name && address.name.toLowerCase() !== "aarav sharma" ? address.name : getLoggedInUserName()), address.phone && /* @__PURE__ */ React.createElement("span", { className: "text-xs md:text-sm font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded" }, "\u{1F4DE} ", address.phone)), /* @__PURE__ */ React.createElement("p", { className: "text-sm md:text-base font-medium text-gray-800 leading-relaxed whitespace-pre-line" }, address.formatted || `${address.line1}
${address.city}, ${address.state}
${address.pincode}, ${address.country}`)))), /* @__PURE__ */ React.createElement("div", { className: "mb-10" }, /* @__PURE__ */ React.createElement("h2", { className: "text-2xl md:text-3xl font-black text-black tracking-wide font-dmsans mb-4" }, "Invoice"), /* @__PURE__ */ React.createElement("div", { className: "border border-gray-300 overflow-hidden bg-white shadow-sm" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs md:text-sm" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-gray-300 bg-white" }, /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 font-bold text-gray-800 w-2/5" }, "Item"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 font-bold text-gray-800 text-center" }, "Qty"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 font-bold text-gray-800 text-right" }, "Price"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 font-bold text-gray-800 text-right" }, "Tax"), /* @__PURE__ */ React.createElement("th", { className: "py-3 px-4 font-bold text-gray-800 text-right" }, "Total"))), /* @__PURE__ */ React.createElement("tbody", null, checkoutItems.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 5, className: "py-8 text-center text-gray-400" }, "No items selected")) : checkoutItems.map((item, index) => {
    const price = Number(item.product?.price || 0);
    const qty = Number(item.quantity || 1);
    const rowTotal = price * qty * 1.18;
    const itemName = item.product?.title || item.product?.name || "INFINITO Premium Tshirt";
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: `checkout-bill-${item.productId}-${item.size}-${index}`,
        className: "border-b border-gray-200 hover:bg-gray-50/50"
      },
      /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 font-bold text-black" }, itemName, " ", item.size ? `(${item.size})` : ""),
      /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-center font-medium text-gray-800" }, qty),
      /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-right font-medium text-gray-800" }, price),
      /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-right font-medium text-gray-800" }, "18%"),
      /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4 text-right font-bold text-gray-900" }, rowTotal.toFixed(2))
    );
  }), /* @__PURE__ */ React.createElement("tr", { className: "border-t border-gray-200 bg-gray-50/50" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4, className: "py-2.5 px-4 font-semibold text-xs md:text-sm text-gray-700 uppercase" }, "Subtotal (Excl. Tax)"), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-4 text-right font-semibold text-xs md:text-sm text-gray-800" }, "\u20B9", subtotal.toFixed(2))), /* @__PURE__ */ React.createElement("tr", { className: "border-t border-gray-100 bg-gray-50/50" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4, className: "py-2 px-4 font-semibold text-xs md:text-sm text-gray-700 uppercase" }, "GST (18%)"), /* @__PURE__ */ React.createElement("td", { className: "py-2 px-4 text-right font-semibold text-xs md:text-sm text-gray-800" }, "\u20B9", taxAmount.toFixed(2))), appliedCoupon && /* @__PURE__ */ React.createElement("tr", { className: "border-t border-emerald-200 bg-emerald-50/60" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4, className: "py-2.5 px-4 font-bold text-xs md:text-sm text-emerald-800" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Tag, { className: "w-3.5 h-3.5 text-emerald-600" }), /* @__PURE__ */ React.createElement("span", null, "Discount (", appliedCoupon.code, ")"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono" }, appliedCoupon.type === "Percentage" ? `${appliedCoupon.value}% OFF` : `\u20B9${appliedCoupon.value} OFF`), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleRemoveCoupon,
      className: "ml-2 text-xs text-red-600 hover:underline cursor-pointer font-medium"
    },
    "[Remove]"
  ))), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-4 text-right font-black text-sm md:text-base text-emerald-700" }, "-\u20B9", discountAmount.toFixed(2))), isUltimateMember && ultimateDiscountAmount > 0 && /* @__PURE__ */ React.createElement("tr", { className: "border-t border-amber-200 bg-amber-50/70" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4, className: "py-2.5 px-4 font-bold text-xs md:text-sm text-amber-900" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Sparkles, { className: "w-3.5 h-3.5 text-amber-600" }), /* @__PURE__ */ React.createElement("span", null, "\u{1F451} Infinito Ultimate VIP Member Discount (10% Auto-Applied)"))), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-4 text-right font-black text-sm md:text-base text-amber-800" }, "-\u20B9", ultimateDiscountAmount.toFixed(2))), /* @__PURE__ */ React.createElement("tr", { className: "border-t-2 border-black bg-white" }, /* @__PURE__ */ React.createElement(
    "td",
    {
      colSpan: 4,
      className: "py-4 px-4 font-black text-sm md:text-base text-black uppercase tracking-wider"
    },
    "TOTAL PAYABLE"
  ), /* @__PURE__ */ React.createElement("td", { className: "py-4 px-4 text-right font-black text-base md:text-lg text-black" }, "\u20B9", grandTotal.toFixed(2)))))), /* @__PURE__ */ React.createElement("div", { className: "mt-6 border border-gray-300 bg-white p-5 md:p-6 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Ticket, { className: "w-5 h-5 text-[#DD1215]" }), /* @__PURE__ */ React.createElement("h3", { className: "font-black uppercase tracking-wider text-sm md:text-base text-black" }, "Apply Coupon / Promo Code")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowCouponList(!showCouponList),
      className: "flex items-center gap-1 text-xs md:text-sm font-bold text-[#DD1215] hover:underline cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", null, showCouponList ? "Hide Available Coupons" : `View Available Offers (${availableCoupons.length})`),
    showCouponList ? /* @__PURE__ */ React.createElement(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ React.createElement(ChevronDown, { className: "w-4 h-4" })
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2.5 max-w-md" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: couponCodeInput,
      onChange: (e) => setCouponCodeInput(e.target.value.toUpperCase()),
      placeholder: "ENTER COUPON CODE",
      className: "flex-1 border border-gray-300 px-3.5 py-2.5 text-sm font-mono uppercase tracking-wider focus:border-black focus:outline-none"
    }
  ), appliedCoupon ? /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleRemoveCoupon,
      className: "px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
    },
    "Remove"
  ) : /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleApplyCoupon(),
      className: "px-6 py-2.5 bg-black hover:bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
    },
    "Apply"
  )), appliedCoupon && /* @__PURE__ */ React.createElement("div", { className: "mt-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-sm flex items-center justify-between text-xs md:text-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-4 h-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, '"', appliedCoupon.code, '"'), " applied! You are saving ", /* @__PURE__ */ React.createElement("strong", null, "\u20B9", discountAmount.toFixed(2)), " on this order.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleRemoveCoupon,
      className: "text-xs text-red-600 hover:underline font-bold ml-3 cursor-pointer shrink-0"
    },
    "Remove"
  )), showCouponList && /* @__PURE__ */ React.createElement("div", { className: "mt-5 pt-4 border-t border-gray-200" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Sparkles, { className: "w-3.5 h-3.5 text-amber-500" }), /* @__PURE__ */ React.createElement("span", null, "Available Coupons for Your Cart")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, availableCoupons.map((coupon) => {
    const isEligible = subtotal >= (coupon.minPurchase || 0);
    const isCurrent = appliedCoupon?.code === coupon.code;
    const shortfall = (coupon.minPurchase || 0) - subtotal;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: coupon.code,
        className: `p-3.5 border rounded-sm transition ${isCurrent ? "border-emerald-500 bg-emerald-50/40 shadow-xs" : isEligible ? "border-gray-300 bg-white hover:border-black" : "border-gray-200 bg-gray-50/60 opacity-80"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono font-black text-xs md:text-sm border border-dashed border-gray-700 px-2 py-0.5 bg-gray-50 tracking-wider" }, coupon.code), coupon.badge && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold px-1.5 py-0.2 bg-red-100 text-[#DD1215] rounded" }, coupon.badge)), isCurrent ? /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-emerald-700 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(Check, { className: "w-3.5 h-3.5" }), " Applied") : isEligible ? /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleApplyCoupon(coupon.code),
          className: "px-3 py-1 bg-black hover:bg-[#DD1215] text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        },
        "Apply"
      ) : /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-amber-700" }, "Add \u20B9", shortfall.toFixed(0), " more")),
      /* @__PURE__ */ React.createElement("p", { className: "text-xs font-bold text-black mt-1" }, coupon.title),
      /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-gray-600 mt-0.5 leading-snug" }, coupon.description),
      coupon.minPurchase > 0 && /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-gray-500 mt-1.5" }, "Min order value: \u20B9", coupon.minPurchase)
    );
  }))))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-4 mt-8" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigate("/cart"),
      className: "w-1/2 py-3.5 border border-[#DD1215] text-[#DD1215] hover:bg-red-50 font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleProceedPayment,
      className: "w-1/2 py-3.5 bg-[#DD1215] hover:bg-red-700 text-white font-bold uppercase text-xs md:text-sm tracking-wider transition cursor-pointer text-center shadow-md"
    },
    "Proceed Payment"
  ))), isEditingAddress && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white max-w-lg w-full p-6 shadow-2xl border border-gray-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pb-3 border-b border-gray-200 mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black uppercase tracking-wider text-black" }, "Edit Delivery Address"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsEditingAddress(false),
      className: "text-gray-400 hover:text-black cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" })
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveAddress, className: "space-y-3.5" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "Recipient Full Name *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: addressForm.name,
      onChange: (e) => setAddressForm({ ...addressForm, name: e.target.value }),
      placeholder: "e.g. Full Name",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "Mobile Number (10 digits) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "tel",
      required: true,
      maxLength: 10,
      value: addressForm.phone,
      onChange: (e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }),
      placeholder: "9876543210",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "Street / Area / House No. *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: addressForm.line1,
      onChange: (e) => setAddressForm({ ...addressForm, line1: e.target.value }),
      placeholder: "Sector 18, House No. 42, Green Park Extension",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "City *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: addressForm.city,
      onChange: (e) => setAddressForm({ ...addressForm, city: e.target.value }),
      placeholder: "Chandigarh",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "State *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: addressForm.state,
      onChange: (e) => setAddressForm({ ...addressForm, state: e.target.value }),
      placeholder: "Punjab",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "PIN Code (6 digits) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      maxLength: 6,
      value: addressForm.pincode,
      onChange: (e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }),
      placeholder: "160018",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase text-gray-700 mb-1" }, "Country"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: addressForm.country,
      onChange: (e) => setAddressForm({ ...addressForm, country: e.target.value }),
      placeholder: "India",
      className: "w-full border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 pt-4 border-t border-gray-200" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setIsEditingAddress(false),
      className: "w-1/2 py-2.5 border border-gray-300 text-gray-700 font-bold uppercase text-xs hover:bg-gray-100 transition cursor-pointer"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "w-1/2 py-2.5 bg-[#DD1215] text-white font-bold uppercase text-xs hover:bg-red-700 transition cursor-pointer"
    },
    "Save Address"
  ))))), showPaymentModal && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white max-w-md w-full p-6 shadow-2xl border border-gray-200" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center pb-3 border-b border-gray-200 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-black uppercase tracking-wider text-black" }, "Select Payment Method"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "Amount: \u20B9", grandTotal.toFixed(2))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowPaymentModal(false),
      className: "text-gray-400 hover:text-black cursor-pointer"
    },
    /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" })
  )), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 mb-6" }, /* @__PURE__ */ React.createElement(
    "label",
    {
      onClick: () => setSelectedPayment("upi"),
      className: `flex items-center justify-between p-3.5 border cursor-pointer transition ${selectedPayment === "upi" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(QrCode, { className: "w-5 h-5 text-[#DD1215]" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-black" }, "UPI / QR Code"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "Google Pay, PhonePe, Paytm"))),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "pay_mode",
        checked: selectedPayment === "upi",
        onChange: () => setSelectedPayment("upi"),
        className: "accent-[#DD1215]"
      }
    )
  ), /* @__PURE__ */ React.createElement(
    "label",
    {
      onClick: () => setSelectedPayment("card"),
      className: `flex items-center justify-between p-3.5 border cursor-pointer transition ${selectedPayment === "card" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(CreditCard, { className: "w-5 h-5 text-[#DD1215]" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-black" }, "Credit / Debit Card"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "Visa, MasterCard, RuPay"))),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "pay_mode",
        checked: selectedPayment === "card",
        onChange: () => setSelectedPayment("card"),
        className: "accent-[#DD1215]"
      }
    )
  ), /* @__PURE__ */ React.createElement(
    "label",
    {
      onClick: () => setSelectedPayment("netbanking"),
      className: `flex items-center justify-between p-3.5 border cursor-pointer transition ${selectedPayment === "netbanking" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Smartphone, { className: "w-5 h-5 text-[#DD1215]" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-black" }, "Net Banking"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "HDFC, SBI, ICICI, Axis"))),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "pay_mode",
        checked: selectedPayment === "netbanking",
        onChange: () => setSelectedPayment("netbanking"),
        className: "accent-[#DD1215]"
      }
    )
  ), /* @__PURE__ */ React.createElement(
    "label",
    {
      onClick: () => setSelectedPayment("cod"),
      className: `flex items-center justify-between p-3.5 border cursor-pointer transition ${selectedPayment === "cod" ? "border-[#DD1215] bg-red-50/50" : "border-gray-200 hover:bg-gray-50"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Banknote, { className: "w-5 h-5 text-[#DD1215]" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold text-black" }, "Cash on Delivery (COD)"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500" }, "Pay when order arrives"))),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: "pay_mode",
        checked: selectedPayment === "cod",
        onChange: () => setSelectedPayment("cod"),
        className: "accent-[#DD1215]"
      }
    )
  )), appliedCoupon && /* @__PURE__ */ React.createElement("div", { className: "mb-4 bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between text-xs text-emerald-800" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(CheckCircle2, { className: "w-4 h-4 text-emerald-600 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, 'Coupon "', appliedCoupon.code, '" applied')), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-emerald-700" }, "-\u20B9", discountAmount.toFixed(2))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleCompletePayment,
      disabled: isProcessingPayment,
      className: "w-full py-4 bg-[#DD1215] hover:bg-red-700 text-white font-black uppercase text-sm tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2"
    },
    isProcessingPayment ? /* @__PURE__ */ React.createElement("span", null, "Processing Payment...") : /* @__PURE__ */ React.createElement("span", null, "Pay \u20B9", grandTotal.toFixed(2))
  ), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex items-center justify-center gap-2 text-xs text-gray-400" }, /* @__PURE__ */ React.createElement(ShieldCheck, { className: "w-4 h-4 text-green-600" }), /* @__PURE__ */ React.createElement("span", null, "256-Bit SSL Encrypted & Secure Payment")))));
};
var Checkout_default = Checkout;
export {
  Checkout_default as default
};
