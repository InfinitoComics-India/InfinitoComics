import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../redux/userSlice.js";
import { FaLeaf, FaArrowRight } from "react-icons/fa";
import { BASE_URL } from "../../utils/constants.js";
import { X, ShieldAlert, Check, Pencil } from "lucide-react";
import comicImg from "../../../assets/Images/captainMarvel.png";
import { updateUser } from "../../services/userServices.js";
import { addUser } from "../../redux/userSlice.js";
import toast, { Toaster } from "react-hot-toast";

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
  <div className="flex items-center justify-between pl-2 pr-4 py-2 border-b">
    <span className="font-medium text-sm">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={enabled} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400 peer peer-checked:bg-red-600 transition-colors" />
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
            className="flex-1 border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
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

// ── Main page ──────────────────────────────────────────────────────
const MyAccountPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({ username: "", email: "", _id: "", characterColors: null });
  const [showDeleteInfo, setShowDeleteInfo] = useState(false);
  const [newsLetter, setNewsLetter] = useState(true);
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setUserData({
        username: user.username || "",
        email: user.email || "",
        _id: user._id || "",
        characterColors: user.characterColors || null,
      });
      setNewsLetter(user.newsLetter !== undefined ? user.newsLetter : true);
    }
  }, []);

  // ── Generic field save ─────────────────────────────────────────
  const saveField = async (field, value) => {
    if (!userData._id) throw new Error("User ID not found");
    await updateUser(userData._id, { [field]: value });
    const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), [field]: value };
    dispatch(addUser(updated));
    setUserData(prev => ({ ...prev, [field]: value }));
    toast.success(`${field === "username" ? "Username" : "Email"} updated!`);
  };

  // ── Newsletter ─────────────────────────────────────────────────
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

  // ── Logout ─────────────────────────────────────────────────────
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

  return (
    <div className="bg-white px-4 sm:px-12 pt-8 pb-16 font-sans text-black min-h-screen w-full max-w-[1280px] mx-auto">
      <Toaster position="top-right" />
      <div className="text-2xl font-black tracking-widest mb-8 text-left">MY ACCOUNT</div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">

        {/* ── Left Profile Panel ── */}
        <div className="border border-gray-300 p-6 flex flex-col items-center w-full md:w-64 md:min-w-[256px] bg-white">
          {/* Character avatar or fallback */}
          {userData.characterColors ? (
            <div className="mb-4">
              <CharacterPreview colors={userData.characterColors} />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-3xl font-bold text-gray-400 border border-gray-200">
              {userData.username?.[0]?.toUpperCase() || "?"}
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
            label="Email"
            value={userData.email}
            onSave={(val) => saveField("email", val)}
            validate={(val) => {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email";
              return "";
            }}
          />

          <button
            onClick={() => navigate("/signup?step=3")}
            className="mt-3 w-full text-xs text-gray-400 hover:text-red-600 underline text-center transition"
          >
            Customise avatar →
          </button>
        </div>

        {/* ── Right Main Section ── */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Subscription Plan */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold tracking-wide">My subscription plan</h2>
            </div>
            <div className="bg-pink-100 border border-pink-200 px-6 py-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FaLeaf className="text-black text-lg" />
                <span className="font-bold uppercase tracking-widest">FREE</span>
              </div>
              <span className="text-xs text-red-600 font-medium flex-1 text-center">
                Upgrade now and enjoy ad-free, unlimited access!
              </span>
              <button
                onClick={() => navigate("/ultimate")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest flex items-center transition-colors rounded-none"
              >
                UPGRADE PLAN <FaArrowRight className="ml-2 text-xs" />
              </button>
            </div>
          </div>

          {/* My Orders */}
          <div className="mb-2">
            <div className="text-base font-bold tracking-wide mb-2">My Orders</div>
            <div className="flex flex-row gap-4">
              {[
                { label: "TRACK ORDERS",  route: "/orders/track"   },
                { label: "ORDER HISTORY", route: "/orders/history" },
              ].map(({ label, route }) => (
                <button
                  key={label}
                  onClick={() => navigate(route)}
                  className="relative w-44 h-32 bg-gray-100 flex-shrink-0 overflow-hidden group"
                >
                  <img
                    src={comicImg}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                    <span className="uppercase text-xs tracking-widest flex items-center justify-between w-full">
                      {label} <FaArrowRight className="ml-2 text-xs" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="mb-10">
            <div className="text-lg font-semibold mb-4">Account Settings</div>
            <ToggleRow
              label={savingNewsletter ? "Subscriptions related mails (saving…)" : "Subscriptions related mails"}
              enabled={newsLetter}
              onChange={handleNewsletterToggle}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div className="flex flex-wrap gap-3">
              <button
                className="border border-black px-5 py-2 text-xs tracking-widest font-bold uppercase hover:bg-gray-100 flex items-center group transition"
                onClick={() => navigate("/feedback")}
              >
                GIVE FEEDBACK <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-black px-5 py-2 text-xs tracking-widest font-bold uppercase hover:bg-gray-100 flex items-center group transition"
                onClick={() => navigate("/ErrorReport")}
              >
                SUPPORT US <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-red-600 text-red-600 px-5 py-2 text-xs tracking-widest font-bold uppercase hover:bg-red-600 hover:text-white flex items-center group transition"
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

      {/* Delete Modal */}
      {showDeleteInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowDeleteInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <ShieldAlert size={28} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Account Deletion</h3>
            </div>
            <p className="text-sm text-gray-600 text-center leading-relaxed mb-2">
              Account deletion can only be performed by an <span className="font-semibold text-gray-900">Infinito administrator</span>.
            </p>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              Contact us at{" "}
              <a href="mailto:support@infinitohq.com" className="text-red-600 font-semibold hover:underline">
                support@infinitohq.com
              </a>
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteInfo(false)} className="px-6 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition">
                Close
              </button>
              <a
                href="mailto:support@infinitohq.com?subject=Account%20Deletion%20Request"
                className="px-6 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition flex items-center gap-2"
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
