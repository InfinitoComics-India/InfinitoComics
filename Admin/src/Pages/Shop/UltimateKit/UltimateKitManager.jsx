import React, { useState, useEffect } from 'react';
import { 
  Gift, Sparkles, Check, Image as ImageIcon, Upload, Plus, Trash2, 
  ExternalLink, Eye, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, Save
} from 'lucide-react';
import { message, Spin, Popconfirm } from 'antd';
import { getUltimateKit, updateUltimateKit, DEFAULT_ULTIMATE_KIT } from '../../../services/shopServices/marketingService';
import { BACKEND_URL } from '../../../Utils/constant';

const DEFAULT_MOCKUP_IMAGE = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80";

const UltimateKitManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [kit, setKit] = useState({
    ...DEFAULT_ULTIMATE_KIT,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getUltimateKit();
      if (data) {
        setKit(prev => ({
          ...prev,
          ...data,
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : DEFAULT_ULTIMATE_KIT.features,
        }));
      }
    } catch (err) {
      console.error('Failed to load ultimate kit config:', err);
      message.error('Failed to load ultimate kit data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUltimateKit(kit);
      message.success('Ultimate Kit configuration saved and synced live to the website!');
    } catch (err) {
      console.error('Failed to save ultimate kit:', err);
      message.error('Failed to save ultimate kit changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setKit(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeatureText.trim()],
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx) => {
    setKit(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== idx),
    }));
  };

  const handleFeatureChange = (idx, value) => {
    const updated = [...(kit.features || [])];
    updated[idx] = value;
    setKit(prev => ({ ...prev, features: updated }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return message.error('Please upload an image file (PNG, JPG, WEBP)');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setKit(prev => ({ ...prev, image: compressed }));
        message.success('Kit image updated!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading Ultimate Kit configuration...</p>
      </div>
    );
  }

  const previewImage = kit.image || DEFAULT_MOCKUP_IMAGE;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#DD1215]">
              <Gift size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ultimate Kit Manager</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize the featured Ultimate Kit card on the shop homepage. Edit photo, prices, features, and buy now triggers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw size={14} /> Reset Changes
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Spin size="small" /> : <Save size={15} />}
            {saving ? 'Saving & Syncing...' : 'Save & Publish Changes'}
          </button>
        </div>
      </div>

      {/* ── LIVE INTERACTIVE STOREFRONT PREVIEW ──────────────────── */}
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Eye size={15} className="text-[#DD1215]" />
            Live Customer Storefront Preview (Exact Website Layout)
          </span>
          <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            ● Active on Shop Homepage
          </span>
        </div>

        {/* Section Title */}
        <h2 className="text-xl md:text-2xl font-black text-center mb-6 uppercase tracking-wider font-sans text-gray-900">
          {kit.sectionTitle || 'ULTIMATE KIT'}
        </h2>

        {/* The Card Component */}
        <div className="max-w-[850px] mx-auto border-2 border-gray-200 rounded-2xl bg-white shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all hover:shadow-lg">
          {/* Left Column: Kit Image */}
          <div className="md:col-span-7 bg-gradient-to-br from-red-50/40 via-white to-gray-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={previewImage}
                alt={kit.title || 'Infinito Ultimate Kit'}
                className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = DEFAULT_MOCKUP_IMAGE;
                }}
              />
            </div>
          </div>

          {/* Right Column: Information, Checklist, Price & Action */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Badge & Title */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block bg-[#DD1215] text-white font-black text-[11px] px-2 py-0.5 rounded-xs uppercase tracking-wider mb-1">
                    {kit.badgeText || 'INFINITO'}
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight uppercase">
                    {kit.title || 'ULTIMATE KIT'}
                  </h3>
                </div>

                {/* Pricing */}
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-400 line-through font-semibold">
                    {kit.originalPrice || '₹2199'}
                  </div>
                  <div className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                    {kit.salePrice || '₹1999'}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-200 my-3" />

              {/* Checklist Features */}
              <div className="space-y-2 py-1">
                {(kit.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-800 font-medium">
                    <div className="w-4 h-4 rounded-full border-2 border-[#DD1215] flex items-center justify-center shrink-0">
                      <Check size={10} className="text-[#DD1215] stroke-[3]" />
                    </div>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Action Button */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#DD1215] hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <span>{kit.buttonText || 'Get Now'}</span>
                <ArrowRight size={15} />
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-1.5 font-medium">
                ⚡ Directly opens checkout in Buy Now single product mode
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD EDITING FORMS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form: Titles, Badge & Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">1</span>
            Card Headings & Pricing
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Top Section Heading (displayed above card)
            </label>
            <input
              type="text"
              value={kit.sectionTitle}
              onChange={(e) => setKit({ ...kit, sectionTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
              placeholder="e.g. ULTIMATE KIT"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={kit.badgeText}
                onChange={(e) => setKit({ ...kit, badgeText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="e.g. INFINITO"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Card Main Title
              </label>
              <input
                type="text"
                value={kit.title}
                onChange={(e) => setKit({ ...kit, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="e.g. ULTIMATE KIT"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Original Price (Strikethrough)
              </label>
              <input
                type="text"
                value={kit.originalPrice}
                onChange={(e) => setKit({ ...kit, originalPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="e.g. ₹2199"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Sale / Active Price (₹)
              </label>
              <input
                type="text"
                value={kit.salePrice}
                onChange={(e) => setKit({ ...kit, salePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-[#DD1215] focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="e.g. ₹1999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={kit.buttonText}
                onChange={(e) => setKit({ ...kit, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="e.g. Get Now"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Kit Product SKU
              </label>
              <input
                type="text"
                value={kit.sku}
                onChange={(e) => setKit({ ...kit, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
                placeholder="INF-ULTIMATE-KIT"
              />
            </div>
          </div>
        </div>

        {/* Right Form: Kit Image & Upload */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">2</span>
            Merchandise Pack Display Image
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Image URL (Direct link)
            </label>
            <input
              type="text"
              value={kit.image}
              onChange={(e) => setKit({ ...kit, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
              placeholder="https://... or /products/ultimate_kit_box.jpg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-2 shadow-xs">
              <Upload size={14} />
              <span>Upload Custom Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileUpload}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setKit({ ...kit, image: '' });
                message.info('Reset image to default vector mockup.');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Use Default Asset
            </button>
          </div>

          {/* Current Image Thumbnail Preview */}
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-4">
            <img
              src={previewImage}
              alt="Kit Preview"
              className="w-16 h-16 object-contain rounded border bg-white"
            />
            <div className="text-xs text-gray-500 truncate flex-1">
              <span className="font-semibold text-gray-700 block">Current Image Source:</span>
              <span className="truncate block">{kit.image || 'Default Vector/Asset Mockup'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CHECKLIST FEATURES MANAGER ─────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">3</span>
            Checklist Features & Inclusions (Items included in this kit)
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {(kit.features || []).length} Inclusions Listed
          </span>
        </div>

        {/* Existing Checklist Items */}
        <div className="space-y-2.5">
          {(kit.features || []).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-red-50 text-[#DD1215] flex items-center justify-center font-bold text-xs shrink-0">
                #{idx + 1}
              </div>
              <input
                type="text"
                value={feat}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
              />
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition shrink-0 cursor-pointer"
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Checklist Item */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newFeatureText}
            onChange={(e) => setNewFeatureText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature();
              }
            }}
            placeholder="Add new inclusion (e.g. Exclusive Collector's Badge)..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> Add Feature
          </button>
        </div>
      </div>

      {/* ── Bottom Save Action Bar ──────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="text-xs text-gray-500">
          Clicking save instantly publishes the card changes to the live Shop homepage.
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
        >
          {saving && <Spin size="small" />}
          {saving ? 'Publishing...' : 'Save & Publish Live'}
        </button>
      </div>
    </div>
  );
};

export default UltimateKitManager;
