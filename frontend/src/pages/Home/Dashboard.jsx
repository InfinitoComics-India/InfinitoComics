import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser, addUser } from "../../redux/userSlice.js";
import { FaLeaf, FaArrowRight } from "react-icons/fa";
import { BASE_URL } from "../../utils/constants.js";
import {
  X, ShieldAlert, Check, Pencil, ShoppingBag, Package, MapPin,
  CreditCard, Clock, Truck, ChevronRight, Download, Eye, RotateCcw,
  Plus, Trash2, Home, Building2, Search, ExternalLink, Sparkles,
  AlertCircle, CheckCircle2, ArrowLeft
} from "lucide-react";
import comicImg from "../../../assets/Images/captainMarvel.png";
import { updateUser } from "../../services/userServices.js";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllOrders,
  getSavedAddresses,
  saveNewAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
  downloadInvoicePdf,
} from "../../services/orderService.js";

// ── Character preview (uses saved colors or defaults) ──────────────
const CharacterPreview = ({ colors }) => {
  const c = colors || {
    head: "#C8729A", body: "#C8729A", weapon: "#888",
    legs: "#C8729A", accessory: "#888",
  };
  return (
    <div className="relative w-20 h-36 mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-sm" style={{ backgroundColor: c.head }} />
      <div className="absolute top-9 left-1/2 -translate-x-1/2 w-7 h-11 rounded-sm" style={{ backgroundColor: c.body }} />
      <div className="absolute top-11 left-0 w-2.5 h-7 rounded-sm" style={{ backgroundColor: c.weapon }} />
      <div className="absolute top-[78px] left-1/2 -translate-x-1/2 flex gap-1">
        <div className="w-3 h-7 rounded-sm" style={{ backgroundColor: c.legs }} />
        <div className="w-3 h-7 rounded-sm" style={{ backgroundColor: c.legs }} />
      </div>
    </div>
  );
};

// ── Newsletter toggle ──────────────────────────────────────────────
const ToggleRow = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between pl-2 pr-4 py-2 border-b border-gray-100">
    <span className="font-medium text-sm text-gray-800">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={enabled} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400 peer peer-checked:bg-[#DD1215] transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 transition-transform peer-checked:translate-x-5" />
    </label>
  </div>
);

// ── Inline editable field ──────────────────────────────────────────
const EditableField = ({ label, value, onSave, validate }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    const err = validate ? validate(draft) : "";
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full mb-3">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={e => { setDraft(e.target.value); setError(""); }}
            className="flex-1 border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 bg-[#DD1215] text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button onClick={() => { setEditing(false); setError(""); }} className="p-1.5 border rounded hover:bg-gray-100 transition">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <span className="font-semibold text-sm text-gray-800 truncate">{value || "—"}</span>
          <button
            onClick={() => setEditing(true)}
            className="ml-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Edit ${label}`}
          >
            <Pencil size={14} />
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ── Status Badge Styler ────────────────────────────────────────────
const getStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("cancel")) {
    return { label: "Cancelled", bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
  }
  if (s.includes("deliver")) {
    return { label: "Delivered", bg: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" };
  }
  if (s.includes("out for delivery") || s.includes("ship")) {
    return { label: "In Transit", bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" };
  }
  if (s.includes("process")) {
    return { label: "Processing", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
  }
  return { label: "Order Placed", bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" };
};

// ── Main Page Component ────────────────────────────────────────────
const MyAccountPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'overview' | 'orders' | 'addresses' | 'subscription'
  const activeTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const [userData, setUserData] = useState({ username: "", email: "", _id: "", characterColors: null });
  const [showDeleteInfo, setShowDeleteInfo] = useState(false);
  const [newsLetter, setNewsLetter] = useState(true);
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  // Shop Orders & Addresses State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all"); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "Home",
    isDefault: false,
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "orders", "addresses", "subscription"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    // 1. Load User data
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user) {
        setUserData({
          username: user.username || user.name || "",
          email: user.email || "",
          _id: user._id || "",
          characterColors: user.characterColors || null,
        });
        setNewsLetter(user.newsLetter !== undefined ? user.newsLetter : true);
      }
    } catch {}

    // 2. Load Orders
    const allOrders = getAllOrders();
    setOrders(allOrders);

    // 3. Load Saved Addresses
    const saved = getSavedAddresses();
    setAddresses(saved);
  }, []);

  // ── Generic user field save ───────────────────────────────────────
  const saveField = async (field, value) => {
    if (!userData._id) throw new Error("User ID not found");
    await updateUser(userData._id, { [field]: value });
    const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), [field]: value };
    dispatch(addUser(updated));
    setUserData(prev => ({ ...prev, [field]: value }));
    toast.success(`${field === "username" ? "Username" : "Email"} updated!`);
  };

  // ── Newsletter Toggle ─────────────────────────────────────────────
  const handleNewsletterToggle = async () => {
    const newValue = !newsLetter;
    setNewsLetter(newValue);
    if (!userData._id) return;
    try {
      setSavingNewsletter(true);
      await updateUser(userData._id, { newsLetter: newValue });
      const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), newsLetter: newValue };
      dispatch(addUser(updated));
    } catch {
      setNewsLetter(!newValue);
    } finally {
      setSavingNewsletter(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await axios.post(`${BASE_URL}/api/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  // ── Address Actions ───────────────────────────────────────────────
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: userData.username || "",
      phone: "",
      line1: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "Home",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      type: addr.type || "Home",
      isDefault: Boolean(addr.isDefault),
    });
    setShowAddressModal(true);
  };

  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    if (!addressForm.line1 || !addressForm.city || !addressForm.pincode) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (editingAddressId) {
      updateSavedAddress(editingAddressId, addressForm);
      toast.success("Address updated successfully!");
    } else {
      saveNewAddress(addressForm);
      toast.success("New address added successfully!");
    }

    setAddresses(getSavedAddresses());
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm("Are you sure you want to remove this address?")) {
      const updated = deleteSavedAddress(id);
      setAddresses(updated);
      toast.success("Address removed");
    }
  };

  const handleSetDefaultAddress = (id) => {
    const updated = setDefaultSavedAddress(id);
    setAddresses(updated);
    toast.success("Default address updated");
  };

  // ── Filtered Orders ───────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    // Search query match (Order #, item names)
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const idMatch = String(order.id || order.orderId || "").toLowerCase().includes(q);
      const itemMatch = (order.items || []).some(
        (it) => (it.product?.name || it.product?.title || "").toLowerCase().includes(q)
      );
      if (!idMatch && !itemMatch) return false;
    }

    // Filter pill match
    const st = String(order.status || "").toLowerCase();
    if (orderFilter === "active") {
      return !st.includes("deliver") && !st.includes("cancel");
    }
    if (orderFilter === "delivered") {
      return st.includes("deliver");
    }
    if (orderFilter === "cancelled") {
      return st.includes("cancel");
    }
    return true;
  });

  const activeOrdersCount = orders.filter(
    (o) => !String(o.status || "").toLowerCase().includes("deliver") && !String(o.status || "").toLowerCase().includes("cancel")
  ).length;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const hasUltimate = user?.hasInfinitoUltimate;
  const membershipType = user?.membershipType;
  const expiry = user?.membershipExpiry;
  const planLabel = hasUltimate ? (membershipType || "ULTIMATE") : membershipType ? membershipType : "FREE";
  const isPaid = hasUltimate || !!membershipType;

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-gray-900 pb-20">
      <Toaster position="top-right" />

      {/* ── Top Header Hero Banner ── */}
      <div className="bg-[#121212] border-b border-gray-800 text-white pt-10 pb-8 px-4 sm:px-10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#DD1215] mb-2">
              <Sparkles size={14} /> INFINITO MEMBER PORTAL
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-white">
              MY ACCOUNT <span className="text-gray-500 text-lg font-normal">| {userData.username || "Customer"}</span>
            </h1>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#1e1e1e] border border-gray-800 px-4 py-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-[#DD1215]">
                <Package size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Total Orders</p>
                <p className="text-sm font-bold text-white">{orders.length}</p>
              </div>
            </div>

            <div className="bg-[#1e1e1e] border border-gray-800 px-4 py-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">In Transit</p>
                <p className="text-sm font-bold text-amber-400">{activeOrdersCount}</p>
              </div>
            </div>

            <div className="bg-[#1e1e1e] border border-gray-800 px-4 py-2.5 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Saved Addresses</p>
                <p className="text-sm font-bold text-white">{addresses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-[1280px] mx-auto mt-8 border-b border-gray-800 flex overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          {[
            { id: "overview", label: "Overview & Profile", icon: Home },
            { id: "orders", label: `My Orders (${orders.length})`, icon: Package },
            { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: MapPin },
            { id: "subscription", label: "Membership & Perks", icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all shrink-0
                ${activeTab === id
                  ? "border-[#DD1215] text-[#DD1215] bg-[#DD1215]/10"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
                }
              `}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Tab Content Container ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 pt-8">

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & PROFILE
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">

            {/* Left Profile Panel (Original Identity Preserved) */}
            <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center w-full lg:w-72 bg-white shadow-sm shrink-0">
              <div className="text-xs uppercase font-mono tracking-widest text-gray-400 mb-4 font-bold">
                MEMBER AVATAR
              </div>

              {userData.characterColors ? (
                <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <CharacterPreview colors={userData.characterColors} />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center mb-4 text-3xl font-black text-gray-400 border border-gray-300">
                  {userData.username?.[0]?.toUpperCase() || "I"}
                </div>
              )}

              <EditableField
                label="Username"
                value={userData.username}
                onSave={(val) => saveField("username", val)}
                validate={(val) => {
                  if (!val || val.length < 6 || val.length > 30) return "Username must be 6–30 characters";
                  if (!/^[0-9a-zA-Z._]+$/.test(val)) return "Only letters, numbers, _ and . allowed";
                  return "";
                }}
              />

              <EditableField
                label="Email Address"
                value={userData.email}
                onSave={(val) => saveField("email", val)}
                validate={(val) => {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email";
                  return "";
                }}
              />

              <hr className="w-full my-6 border-gray-200" />

              {/* Quick links inside profile */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => handleTabChange("orders")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-50 rounded flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><Package size={14} className="text-[#DD1215]" /> Orders & Shipments</span>
                  <span className="text-gray-400 font-bold">{orders.length}</span>
                </button>
                <button
                  onClick={() => handleTabChange("addresses")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-50 rounded flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-[#DD1215]" /> Delivery Addresses</span>
                  <span className="text-gray-400 font-bold">{addresses.length}</span>
                </button>
                <button
                  onClick={() => handleTabChange("subscription")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-50 rounded flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2"><Sparkles size={14} className="text-[#DD1215]" /> Membership Plan</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isPaid ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{planLabel}</span>
                </button>
              </div>
            </div>

            {/* Right Overview Dashboard Section */}
            <div className="flex-1 flex flex-col gap-6 w-full">

              {/* 1. Paid Membership Status Banner (Only shown if user has an active paid subscription) */}
              {isPaid && (
                <div className="rounded-xl border p-5 sm:p-6 transition-all bg-amber-50/60 border-amber-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#DD1215]">
                        <FaLeaf className="text-lg" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm uppercase tracking-widest">{planLabel} PLAN</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {expiry
                            ? `Valid through ${new Date(expiry).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`
                            : "Enjoy digital comic reader access & exclusive member merch discounts"
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTabChange("subscription")}
                      className="border border-amber-300 bg-white text-amber-900 hover:bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition"
                    >
                      View Perks
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Recent Active Order Card */}
              {orders.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-[#DD1215]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                        Most Recent Order ({orders[0].orderId || `#${orders[0].id}`})
                      </h2>
                    </div>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="text-xs font-bold text-[#DD1215] hover:underline flex items-center gap-1"
                    >
                      View All Orders ({orders.length}) <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Order Preview Content */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                        <img
                          src={orders[0].items?.[0]?.product?.image || orders[0].items?.[0]?.product?.images?.[0]?.url || comicImg}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {(() => {
                            const badge = getStatusBadge(orders[0].status);
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                {badge.label}
                              </span>
                            );
                          })()}
                          <span className="text-xs text-gray-400">
                            {orders[0].createdAt ? new Date(orders[0].createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">
                          {orders[0].items?.[0]?.product?.title || orders[0].items?.[0]?.product?.name || "INFINITO Merch"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {orders[0].items?.length || 1} item(s) • Total: ₹{Number(orders[0].total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/order-details/${orders[0].id || orders[0].orderId}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => downloadInvoicePdf(orders[0])}
                        className="px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition flex items-center gap-1.5"
                      >
                        <Download size={13} /> Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty orders banner */
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">No orders placed yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-1">
                      Check out the official Infinito Comics Store for exclusive graphic novels, hero tees, and collectibles.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/shop")}
                    className="bg-[#DD1215] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
                  >
                    Browse Merch & Comics
                  </button>
                </div>
              )}

              {/* 3. Account Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="border border-red-200 bg-red-50 text-[#DD1215] px-4 py-2 text-xs tracking-wider font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white flex items-center group transition"
                    onClick={handleLogout}
                  >
                    LOG OUT <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <button
                  onClick={() => setShowDeleteInfo(true)}
                  className="text-xs tracking-widest text-gray-400 hover:text-red-600 font-bold uppercase transition"
                >
                  DELETE MY ACCOUNT
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: MY ORDERS (E-COMMERCE HUB)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="space-y-6">

            {/* Filter Bar & Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {[
                  { id: "all", label: `All (${orders.length})` },
                  { id: "active", label: `In Transit (${activeOrdersCount})` },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setOrderFilter(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition
                      ${orderFilter === id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Package size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">No matching orders found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">
                    {orderSearch ? "Try adjusting your search query or filter." : "You have not placed any orders under this filter."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-[#DD1215] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
                >
                  Explore Store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const isCancelled = String(ord.status || "").toLowerCase().includes("cancel");
                  const isDelivered = String(ord.status || "").toLowerCase().includes("deliver");

                  return (
                    <div
                      key={ord.id || ord.orderId}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition"
                    >
                      {/* Order Card Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-6 text-xs">
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest text-[10px] block">Order Placed</span>
                            <span className="font-semibold text-gray-800">
                              {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest text-[10px] block">Total Amount</span>
                            <span className="font-bold text-gray-900">
                              ₹{Number(ord.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 uppercase tracking-widest text-[10px] block">Ship To</span>
                            <span className="font-semibold text-gray-800 truncate max-w-[150px] block">
                              {ord.address?.city ? `${ord.address.city}, ${ord.address.state || ""}` : "Home Address"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                          </span>
                          <span className="font-mono text-xs font-bold text-gray-500">
                            {ord.orderId || `#${ord.id}`}
                          </span>
                        </div>
                      </div>

                      {/* Order Items & Timeline Body */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

                          {/* Items Column (2/3) */}
                          <div className="lg:col-span-2 space-y-4">
                            {(ord.items || []).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                  <img
                                    src={item.product?.image || item.product?.images?.[0]?.url || comicImg}
                                    alt={item.product?.name || "Product"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-gray-900 truncate">
                                    {item.product?.title || item.product?.name || "INFINITO Merch"}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Size: <span className="font-semibold text-gray-700">{item.size || "Standard"}</span> • Qty: <span className="font-semibold text-gray-700">{item.quantity || 1}</span>
                                  </p>
                                  <p className="text-xs font-bold text-gray-900 mt-1">
                                    ₹{Number(item.product?.price || 0).toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Actions Column (1/3) */}
                          <div className="flex flex-col gap-2.5 lg:border-l lg:border-gray-100 lg:pl-6">
                            <button
                              onClick={() => navigate(`/order-details/${ord.id || ord.orderId}`)}
                              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Eye size={14} /> View Order Details
                            </button>

                            <button
                              onClick={() => downloadInvoicePdf(ord)}
                              className="w-full py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
                            >
                              <Download size={14} /> Download Invoice (PDF)
                            </button>

                            {!isCancelled && !isDelivered && (
                              <button
                                onClick={() => setTrackingModalOrder(ord)}
                                className="w-full py-2 px-4 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
                              >
                                <Truck size={14} /> Live Tracking
                              </button>
                            )}

                            {!isCancelled && !isDelivered && (
                              <button
                                onClick={() => navigate(`/order-cancel/${ord.id || ord.orderId}`)}
                                className="w-full text-center text-xs text-red-600 hover:text-red-700 font-semibold py-1 transition"
                              >
                                Cancel Order
                              </button>
                            )}

                            {isCancelled && (
                              <div className="text-center text-xs text-gray-400 font-mono py-1">
                                Refund: ₹{Number(ord.refundAmount || 0).toFixed(2)} processed
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: SAVED ADDRESSES
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "addresses" && (
          <div className="space-y-6">

            {/* Header info & Add Button */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-gray-900">
                  Manage Delivery Addresses
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Your primary address is automatically pre-filled at checkout for faster 1-click orders.
                </p>
              </div>

              <button
                onClick={handleOpenAddAddress}
                className="bg-[#DD1215] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition shadow-sm"
              >
                <Plus size={15} /> Add New Address
              </button>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all relative ${
                    addr.isDefault
                      ? "border-[#DD1215] ring-2 ring-red-100 shadow-md"
                      : "border-gray-200 shadow-sm hover:border-gray-300"
                  }`}
                >
                  {/* Top row */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-1 rounded">
                        {addr.type === "Work" ? <Building2 size={13} /> : <Home size={13} />}
                        {addr.type || "Home"}
                      </span>

                      {addr.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DD1215] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} /> Default
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 mb-1">
                      {addr.name || userData.username || "Infinito Reader"}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">{addr.phone || "+91 (Contact on delivery)"}</p>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      {addr.line1}
                    </p>
                    <p className="text-xs text-gray-700 font-medium mt-1">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{addr.country || "India"}</p>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition"
                        title="Edit address"
                      >
                        <Pencil size={15} />
                      </button>

                      {!addr.isDefault && (
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete address"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs font-bold text-gray-600 hover:text-[#DD1215] tracking-wider uppercase transition"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium italic">Active Delivery</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: SUBSCRIPTION & PERKS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "subscription" && (
          <div className="space-y-6">

            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#DD1215] bg-red-50 px-3 py-1 rounded-full mb-3">
                  <Sparkles size={13} /> INFINITO ULTIMATE ECOSYSTEM
                </div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-2">
                  {planLabel} MEMBERSHIP TIER
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Experience seamless comic reading and exclusive shop discounts tailored for passionate comic enthusiasts.
                </p>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { title: "Unlimited Digital Comics", desc: "Access the entire library of graphic novels & chapters." },
                    { title: "10% Merch Discount", desc: "Automatic 10% discount on all apparel and official store merch." },
                    { title: "Early Release Access", desc: "Read upcoming issue previews 48 hours prior to public drop." },
                    { title: "Priority Dispatch", desc: "POD merch and physical editions ship via express air carrier." },
                  ].map(({ title, desc }) => (
                    <div key={title} className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-100 text-[#DD1215] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!isPaid ? (
                  <button
                    onClick={() => navigate("/ultimate")}
                    className="bg-[#DD1215] hover:bg-red-700 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition shadow-md"
                  >
                    Upgrade to Infinito Ultimate <FaArrowRight size={12} />
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
                      ✅ Your Membership is Active ({expiry ? `Renews on ${new Date(expiry).toLocaleDateString()}` : "Lifetime Tier"})
                    </span>
                    <button
                      onClick={() => navigate("/comics")}
                      className="px-5 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition"
                    >
                      Read Comics Now
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── Address Add/Edit Modal ── */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-[#DD1215]" />
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddressForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Street Address / Flat / Floor *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                  placeholder="House No., Street, Landmark"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                    placeholder="160018"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Address Type
                </label>
                <div className="flex gap-4">
                  {["Home", "Work"].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressForm.type === t}
                        onChange={() => setAddressForm({ ...addressForm, type: t })}
                        className="text-[#DD1215] focus:ring-[#DD1215]"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {/* Default checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#DD1215] focus:ring-[#DD1215]"
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tracking Details Modal ── */}
      {trackingModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Truck size={16} className="text-[#DD1215]" />
                  Shipment Tracking ({trackingModalOrder.orderId || `#${trackingModalOrder.id}`})
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">Carrier: Bluedart Express / Qikink POD</p>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Milestone Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {[
                  { title: "Order Confirmed & Placed", date: trackingModalOrder.timeline?.placedDate || "Day 0", done: true },
                  { title: "Dispatched from Infinito Fulfillment Hub", date: trackingModalOrder.timeline?.dispatchedDate || "Day 2", done: true },
                  { title: "Out for Delivery", date: trackingModalOrder.timeline?.outForDeliveryDate || "Day 4", done: false },
                  { title: "Delivered to Doorstep", date: trackingModalOrder.timeline?.deliveredDate || "Day 6", done: false },
                ].map(({ title, date, done }, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${done ? 'border-[#DD1215] text-[#DD1215]' : 'border-gray-300'}`}>
                      {done && <div className="w-2 h-2 rounded-full bg-[#DD1215]"></div>}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => {
                    const id = trackingModalOrder.id || trackingModalOrder.orderId;
                    setTrackingModalOrder(null);
                    navigate(`/order-details/${id}`);
                  }}
                  className="text-xs font-bold text-[#DD1215] hover:underline"
                >
                  Full Order Details →
                </button>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-5 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Account Deletion Modal (Preserved) ── */}
      {showDeleteInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowDeleteInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <ShieldAlert size={28} className="text-[#DD1215]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Account Deletion</h3>
            </div>
            <p className="text-sm text-gray-600 text-center leading-relaxed mb-2">
              Account deletion can only be performed by an <span className="font-semibold text-gray-900">Infinito administrator</span>.
            </p>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              Contact us at{" "}
              <a href="mailto:support@infinitohq.com" className="text-[#DD1215] font-semibold hover:underline">
                support@infinitohq.com
              </a>
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteInfo(false)} className="px-6 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition">
                Close
              </button>
              <a
                href="mailto:support@infinitohq.com?subject=Account%20Deletion%20Request"
                className="px-6 py-2 bg-[#DD1215] text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition flex items-center gap-2"
              >
                Email Support <FaArrowRight size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyAccountPage;
