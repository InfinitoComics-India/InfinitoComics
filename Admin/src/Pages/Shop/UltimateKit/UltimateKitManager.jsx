import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gift as GiftIcon, Sparkles as SparklesIcon, Check as CheckIcon, 
  Image as ImageIcon, ImageOff, Upload, Plus, Trash2, 
  ExternalLink, Eye, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, Save,
  Package, Search, ShoppingBag, Layers, AlertCircle, X, ChevronRight, Tag as TagIcon
} from 'lucide-react';
import { message, Spin, Popconfirm, Modal, Input, Select, Tag, Tooltip } from 'antd';
import { getUltimateKit, updateUltimateKit, DEFAULT_ULTIMATE_KIT } from '../../../services/shopServices/marketingService';
import { getAllProducts } from '../../../services/shopServices/productService';
import { BACKEND_URL } from '../../../Utils/constant';

const DEFAULT_MOCKUP_IMAGE = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80";

const UltimateKitManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Store Products catalog state
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [kit, setKit] = useState({
    ...DEFAULT_ULTIMATE_KIT,
    includedProducts: [],
    noPhoto: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kitData, productsRes] = await Promise.allSettled([
        getUltimateKit(),
        getAllProducts(),
      ]);

      if (kitData.status === 'fulfilled' && kitData.value) {
        const data = kitData.value;
        const isNoPhoto = Boolean(data.noPhoto || data.image === 'no_photo');
        setKit(prev => ({
          ...prev,
          ...data,
          noPhoto: isNoPhoto,
          image: isNoPhoto ? 'no_photo' : (data.image || data.imageUrl || ''),
          features: Array.isArray(data.features) && data.features.length > 0 ? data.features : DEFAULT_ULTIMATE_KIT.features,
          includedProducts: Array.isArray(data.includedProducts) ? data.includedProducts : [],
        }));
      }

      if (productsRes.status === 'fulfilled') {
        const val = productsRes.value;
        const prods = Array.isArray(val?.data?.data)
          ? val.data.data
          : (Array.isArray(val?.data) ? val.data : []);
        setAllProducts(prods);
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
      const isNoPhoto = kit.noPhoto || kit.image === 'no_photo';
      const activeImg = isNoPhoto ? 'no_photo' : (kit.image || kit.imageUrl || '');
      const payload = {
        ...kit,
        image: activeImg,
        imageUrl: activeImg,
        noPhoto: isNoPhoto,
        title: kit.title || kit.cardTitle || 'ULTIMATE KIT',
        cardTitle: kit.cardTitle || kit.title || 'ULTIMATE KIT',
        includedProducts: Array.isArray(kit.includedProducts) ? kit.includedProducts : [],
      };
      await updateUltimateKit(payload);
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
        setKit(prev => ({ ...prev, image: compressed, noPhoto: false }));
        message.success('Kit image updated!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── INCLUDED PRODUCTS MANAGEMENT ──────────────────────────────
  const handleAddProductToKit = (prod) => {
    const prodId = String(prod._id || prod.id || '');
    if (!prodId) return;

    const alreadyIn = (kit.includedProducts || []).some(
      p => String(p._id || p.id || p.productId) === prodId
    );

    if (alreadyIn) {
      return message.warning(`${prod.title || 'Product'} is already in this kit.`);
    }

    const item = {
      id: prodId,
      _id: prodId,
      productId: prodId,
      title: prod.title || 'Store Product',
      price: Number(prod.price) || 0,
      originalPrice: Number(prod.originalPrice) || Number(prod.price) || 0,
      image: prod.images?.[0] || prod.thumbnail || prod.image || '',
      sku: prod.sku || '',
      category: prod.category?.name || prod.category || 'General',
      quantity: 1,
    };

    setKit(prev => ({
      ...prev,
      includedProducts: [...(prev.includedProducts || []), item],
    }));

    message.success(`Added ${prod.title || 'Product'} to Ultimate Kit`);
  };

  const handleRemoveProductFromKit = (prodId) => {
    setKit(prev => ({
      ...prev,
      includedProducts: (prev.includedProducts || []).filter(
        p => String(p._id || p.id || p.productId) !== String(prodId)
      ),
    }));
    message.info('Removed product from kit');
  };

  const handleUpdateProductQuantity = (prodId, delta) => {
    setKit(prev => ({
      ...prev,
      includedProducts: (prev.includedProducts || []).map(p => {
        if (String(p._id || p.id || p.productId) === String(prodId)) {
          const nextQty = Math.max(1, (p.quantity || 1) + delta);
          return { ...p, quantity: nextQty };
        }
        return p;
      }),
    }));
  };

  // Auto-sync kit checklist features from selected products
  const handleSyncFeaturesWithProducts = () => {
    if (!kit.includedProducts || kit.includedProducts.length === 0) {
      return message.warning('Please add products to the kit first.');
    }
    const productTitles = kit.includedProducts.map(p => {
      const qtyStr = (p.quantity || 1) > 1 ? ` (${p.quantity}x)` : '';
      return `${p.title}${qtyStr}`;
    });

    setKit(prev => ({
      ...prev,
      features: productTitles,
    }));
    message.success('Checklist features updated from included products!');
  };

  // Filter available products for the selection modal
  const categoriesList = useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => {
      const c = p.category?.name || p.category;
      if (c && typeof c === 'string') set.add(c);
    });
    return Array.from(set);
  }, [allProducts]);

  const filteredCatalogProducts = useMemo(() => {
    return allProducts.filter(p => {
      const titleMatch = (p.title || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                         (p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
      const catName = (p.category?.name || p.category || '').toLowerCase();
      const catMatch = categoryFilter === 'ALL' || catName === categoryFilter.toLowerCase();
      return titleMatch && catMatch;
    });
  }, [allProducts, productSearch, categoryFilter]);

  // Combined retail value calculation
  const totalCombinedValue = useMemo(() => {
    return (kit.includedProducts || []).reduce((sum, p) => {
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 1;
      return sum + (price * qty);
    }, 0);
  }, [kit.includedProducts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading Ultimate Kit configuration...</p>
      </div>
    );
  }

  const isNoPhoto = kit.noPhoto === true || kit.image === 'no_photo';
  const previewImage = isNoPhoto ? '' : (kit.image || DEFAULT_MOCKUP_IMAGE);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#DD1215]">
              <GiftIcon size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ultimate Kit Manager</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize the featured Ultimate Kit card on the shop homepage. Edit photo, bundled products, prices, and features.
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
        <div className="max-w-[880px] mx-auto border-2 border-gray-200 rounded-2xl bg-white shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all hover:shadow-lg">
          {/* Left Column: Kit Image / No-Photo Showcase */}
          <div className="md:col-span-7 bg-gradient-to-br from-red-50/40 via-white to-gray-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 relative">
            {isNoPhoto ? (
              /* No-Photo Branded Canvas */
              <div className="w-full h-full min-h-[260px] rounded-xl bg-gradient-to-tr from-gray-900 via-gray-800 to-red-950 p-6 flex flex-col items-center justify-center text-center text-white space-y-4 border border-gray-800 shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-[#DD1215] shadow-lg">
                  <GiftIcon size={34} className="text-red-400" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-[#DD1215] text-white text-[10px] font-black tracking-widest rounded-full uppercase mb-1.5">
                    EXCLUSIVE BUNDLE PACK
                  </span>
                  <h4 className="text-lg font-black tracking-tight text-white uppercase">
                    {kit.title || 'ULTIMATE KIT'}
                  </h4>
                  <p className="text-xs text-gray-300 max-w-xs mt-1">
                    {(kit.includedProducts || []).length > 0 
                      ? `Includes ${kit.includedProducts.length} official items bundled in one package`
                      : 'Special collector merchandise & comic package'}
                  </p>
                </div>

                {/* Mini Included Products Thumbnails if available */}
                {(kit.includedProducts || []).length > 0 && (
                  <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                    {kit.includedProducts.slice(0, 4).map((p, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden" title={p.title}>
                        {p.image ? (
                          <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                        ) : (
                          <Package size={16} className="text-gray-400" />
                        )}
                      </div>
                    ))}
                    {kit.includedProducts.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-[#DD1215]/80 text-white font-bold text-xs flex items-center justify-center border border-red-400">
                        +{kit.includedProducts.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Custom Photo */
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
            )}
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
                      <CheckIcon size={10} className="text-[#DD1215] stroke-[3]" />
                    </div>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Bundled Products mini pill badges */}
              {(kit.includedProducts || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Package size={12} className="text-[#DD1215]" />
                    {kit.includedProducts.length} Bundled Items Inside:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {kit.includedProducts.map((p, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-200 truncate max-w-[170px]">
                        {p.title} {p.quantity > 1 ? `(${p.quantity}x)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

        {/* Right Form: Kit Image & Upload & No Photo Option */}
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
              disabled={isNoPhoto}
              value={isNoPhoto ? '' : kit.image}
              onChange={(e) => setKit({ ...kit, image: e.target.value, noPhoto: false })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215] disabled:bg-gray-100 disabled:text-gray-400"
              placeholder={isNoPhoto ? "No Photo mode active (Card uses branded graphic banner)" : "https://... or /products/ultimate_kit_box.jpg"}
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

            {/* No Photo Button */}
            <button
              type="button"
              onClick={() => {
                const nextNoPhoto = !isNoPhoto;
                setKit({
                  ...kit,
                  noPhoto: nextNoPhoto,
                  image: nextNoPhoto ? 'no_photo' : '',
                });
                if (nextNoPhoto) {
                  message.info('Switched to No Photo banner mode.');
                } else {
                  message.info('No Photo disabled. You can upload an image.');
                }
              }}
              className={`px-3.5 py-2 border rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                isNoPhoto 
                  ? 'bg-red-50 border-[#DD1215] text-[#DD1215]' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ImageOff size={14} />
              <span>{isNoPhoto ? '✓ No Photo Active' : 'No Photo'}</span>
            </button>
          </div>

          {/* Current Image Status Preview */}
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-4">
            {isNoPhoto ? (
              <div className="w-16 h-16 rounded-lg bg-gray-900 text-white flex flex-col items-center justify-center text-[10px] font-bold border border-gray-700 shrink-0">
                <ImageOff size={18} className="text-red-400 mb-1" />
                <span>NO PHOTO</span>
              </div>
            ) : (
              <img
                src={previewImage}
                alt="Kit Preview"
                className="w-16 h-16 object-contain rounded border bg-white shrink-0"
              />
            )}
            <div className="text-xs text-gray-500 truncate flex-1">
              <span className="font-semibold text-gray-700 block">Current Display Mode:</span>
              <span className="truncate block font-medium">
                {isNoPhoto 
                  ? '🎨 No Photo Banner (Stylized Branded Graphic Canvas)' 
                  : (kit.image ? 'Custom Photo / Graphic URL' : 'Default Kit Photo')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: PRODUCTS INCLUDED IN THIS KIT (BUNDLED PRODUCTS) ──────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">3</span>
              Products Included in this Kit (Selected from Store Catalog)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Select which individual products from your all-products inventory are included in this Ultimate Kit pack.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(kit.includedProducts || []).length > 0 && (
              <button
                type="button"
                onClick={handleSyncFeaturesWithProducts}
                className="px-3 py-1.5 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                title="Automatically update checklist features with names of these products"
              >
                <SparklesIcon size={13} />
                <span>Sync Checklist with Products</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>+ Add Products From Store</span>
            </button>
          </div>
        </div>

        {/* Selected Bundled Products List */}
        {(kit.includedProducts || []).length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">No Store Products Selected Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-0.5">
                Click "+ Add Products From Store" above to select comics, apparel, posters, or collectibles from your store products list.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-red-50 text-[#DD1215] border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Catalog Price</th>
                    <th className="py-2.5 px-3 text-center">Quantity in Kit</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kit.includedProducts.map((p, idx) => {
                    const price = Number(p.price) || 0;
                    const qty = Number(p.quantity) || 1;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.image ? (
                                <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                              ) : (
                                <Package size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block truncate max-w-[240px]">
                                {p.title}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 block">
                                SKU: {p.sku || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-full">
                            {p.category || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-semibold text-gray-800">
                          ₹{price.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQuantity(p._id || p.id, -1)}
                              disabled={qty <= 1}
                              className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 font-bold disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-xs">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateProductQuantity(p._id || p.id, 1)}
                              className="w-6 h-6 rounded border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-gray-900">
                          ₹{(price * qty).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProductFromKit(p._id || p.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Remove from kit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bundle Price & Value Summary Card */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700 block">
                  Bundle Value Breakdown
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Total Items: <strong>{kit.includedProducts.reduce((s, p) => s + (p.quantity || 1), 0)}</strong></span>
                  <span>•</span>
                  <span>Total Retail Value: <strong>₹{totalCombinedValue.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>Kit Sale Price: <strong className="text-[#DD1215]">{kit.salePrice || '₹1999'}</strong></span>
                </div>
              </div>

              {totalCombinedValue > 0 && (
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-800">
                  Customer Value Pack: ₹{totalCombinedValue.toLocaleString('en-IN')} worth of items included!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CHECKLIST FEATURES MANAGER ─────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">4</span>
            Checklist Features & Inclusions (Text bullet points on card)
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

      {/* ── MODAL: SELECT PRODUCTS FROM STORE CATALOG ──────────── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Package size={18} className="text-[#DD1215]" />
            <span>Select Products to Include in Ultimate Kit</span>
          </div>
        }
        open={showAddProductModal}
        onCancel={() => setShowAddProductModal(false)}
        footer={null}
        width={750}
      >
        <div className="space-y-4 pt-2">
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by title or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
              />
            </div>
            {categoriesList.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#DD1215] bg-white cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          {/* Product Catalog List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl">
            {filteredCatalogProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No matching store products found.
              </div>
            ) : (
              filteredCatalogProducts.map((p) => {
                const prodId = String(p._id || p.id || '');
                const isAdded = (kit.includedProducts || []).some(
                  x => String(x._id || x.id || x.productId) === prodId
                );
                const img = p.images?.[0] || p.thumbnail || p.image || '';

                return (
                  <div key={prodId} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {img ? (
                          <img src={img} alt={p.title} className="w-full h-full object-contain" />
                        ) : (
                          <Package size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 text-xs block truncate">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="text-[#DD1215] font-bold">₹{p.price || 0}</span>
                          <span>•</span>
                          <span>{p.category?.name || p.category || 'General'}</span>
                          {p.sku && <span>• SKU: {p.sku}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddProductToKit(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-[#DD1215] hover:bg-red-700 text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? '✓ Added' : '+ Add to Kit'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UltimateKitManager;
