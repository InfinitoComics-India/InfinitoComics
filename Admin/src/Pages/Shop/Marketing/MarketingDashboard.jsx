import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tag as TagIcon, Plus, Search, Edit3, Trash2, Copy, Check,
  Sparkles, Sliders, Image as ImageIcon, ExternalLink, RefreshCw,
  Eye, CheckCircle2, Clock, XCircle, AlertCircle, Percent,
  DollarSign, Truck, Gift, Palette, ArrowRight, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { message, Modal, Spin, Tag, Switch, Radio, Input, InputNumber, Select, Tooltip } from 'antd';
import {
  getAllDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeStatus,
  getMarketingBanners,
  updatePromoBanner,
  updateHeroSlider,
  updatePromoBar,
  updatePromoBanners,
  updatePromoBars,
} from '../../../services/shopServices/marketingService';

const MarketingDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'discounts'; // 'discounts' | 'banners'
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(true);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [bannersConfig, setBannersConfig] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [discountFormData, setDiscountFormData] = useState({
    code: '',
    type: 'Percentage',
    value: 10,
    appliesTo: 'All products',
    appliesToDetail: 'All Store Merchandise',
    minPurchase: 0,
    usageLimitTotal: 500,
    onePerCustomer: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    neverExpires: true,
  });

  // Banner & Promotion Multi-Item State
  const [promoBanners, setPromoBanners] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [promoBars, setPromoBars] = useState([]);
  const [savingBanners, setSavingBanners] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [previewPromoIdx, setPreviewPromoIdx] = useState(0);
  const [previewBarIdx, setPreviewBarIdx] = useState(0);

  // Sync activeTab when URL search params change (e.g. clicking sidebar menu items)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [discounts, banners] = await Promise.all([
        getAllDiscountCodes(),
        getMarketingBanners(),
      ]);
      setDiscountCodes(discounts);
      setBannersConfig(banners);

      // Hero Slider (multiple slides)
      setHeroSlides(Array.isArray(banners.heroSlider) ? [...banners.heroSlider] : []);

      // Homepage Promo Banners (multiple banners)
      if (Array.isArray(banners.promoBanners) && banners.promoBanners.length > 0) {
        setPromoBanners([...banners.promoBanners]);
      } else if (banners.promoBanner) {
        setPromoBanners([{ ...banners.promoBanner, id: 'promo-1' }]);
      } else {
        setPromoBanners([]);
      }

      // Top Promo Bars (multiple announcements)
      if (Array.isArray(banners.promoBars) && banners.promoBars.length > 0) {
        setPromoBars([...banners.promoBars]);
      } else if (banners.promoBar) {
        setPromoBars([{ ...banners.promoBar, id: 'bar-1' }]);
      } else {
        setPromoBars([]);
      }
    } catch (err) {
      console.error('Failed to load marketing data:', err);
      message.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    message.success(`Discount code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ── Discount Code Handlers ───────────────────────────────────
  const handleOpenCreateModal = () => {
    setEditingDiscountId(null);
    setDiscountFormData({
      code: '',
      type: 'Percentage',
      value: 10,
      appliesTo: 'All products',
      appliesToDetail: 'All Store Merchandise',
      minPurchase: 0,
      usageLimitTotal: 500,
      onePerCustomer: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      neverExpires: true,
    });
    setDiscountModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingDiscountId(item.id);
    setDiscountFormData({
      code: item.code,
      type: item.type,
      value: item.value,
      appliesTo: item.appliesTo,
      appliesToDetail: item.appliesToDetail || 'All Store Merchandise',
      minPurchase: item.minPurchase || 0,
      usageLimitTotal: item.usageLimitTotal || 500,
      onePerCustomer: !!item.onePerCustomer,
      startDate: item.startDate || new Date().toISOString().split('T')[0],
      endDate: item.endDate || '',
      neverExpires: !item.endDate,
    });
    setDiscountModalOpen(true);
  };

  const handleAutoGenerateCode = () => {
    const prefixes = ['INFINT', 'HERO', 'COMIC', 'SAVE', 'SPECIAL', 'CRIMSON'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setDiscountFormData((prev) => ({
      ...prev,
      code: `${randomPrefix}${randomNum}`,
    }));
  };

  const handleSaveDiscount = async () => {
    if (!discountFormData.code.trim()) {
      return message.warning('Please enter a valid discount code');
    }

    try {
      const payload = {
        code: discountFormData.code.toUpperCase().trim(),
        type: discountFormData.type,
        value: Number(discountFormData.value || 0),
        appliesTo: discountFormData.appliesTo,
        appliesToDetail: discountFormData.appliesToDetail,
        minPurchase: Number(discountFormData.minPurchase || 0),
        usageLimitTotal: Number(discountFormData.usageLimitTotal || 0),
        onePerCustomer: discountFormData.onePerCustomer,
        startDate: discountFormData.startDate,
        endDate: discountFormData.neverExpires ? '' : discountFormData.endDate,
      };

      if (editingDiscountId) {
        await updateDiscountCode(editingDiscountId, payload);
        message.success(`Discount code ${payload.code} updated successfully`);
      } else {
        await createDiscountCode(payload);
        message.success(`Discount code ${payload.code} created successfully`);
      }

      setDiscountModalOpen(false);
      const updated = await getAllDiscountCodes();
      setDiscountCodes(updated);
    } catch (err) {
      console.error(err);
      message.error('Failed to save discount code');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const updated = await toggleDiscountCodeStatus(id);
      message.success(`Discount status updated to ${updated.status}`);
      const list = await getAllDiscountCodes();
      setDiscountCodes(list);
    } catch (err) {
      message.error('Failed to toggle discount status');
    }
  };

  const handleDeleteDiscount = async (id, code) => {
    Modal.confirm({
      title: `Delete Discount Code ${code}?`,
      content: 'This will permanently remove this code and deactivate future redemptions.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteDiscountCode(id);
          message.success(`Discount code ${code} deleted`);
          const list = await getAllDiscountCodes();
          setDiscountCodes(list);
        } catch (err) {
          message.error('Failed to delete discount code');
        }
      },
    });
  };

  // ── Multi-Banner / Slider Save Handlers ───────────────────────
  const handleSaveHeroSlider = async () => {
    try {
      setSavingBanners(true);
      await updateHeroSlider(heroSlides);
      message.success('Hero Slider slides saved and synced with Shop frontend!');
    } catch (err) {
      message.error('Failed to save hero slider');
    } finally {
      setSavingBanners(false);
    }
  };

  const handleSavePromoBanners = async () => {
    try {
      setSavingBanners(true);
      await updatePromoBanners(promoBanners);
      message.success('Homepage Promo Banners saved and integrated with Shop frontend!');
    } catch (err) {
      message.error('Failed to save promo banners');
    } finally {
      setSavingBanners(false);
    }
  };

  const handleSavePromoBars = async () => {
    try {
      setSavingBanners(true);
      await updatePromoBars(promoBars);
      message.success('Announcement Bars saved and live on Shop frontend!');
    } catch (err) {
      message.error('Failed to save promo bars');
    } finally {
      setSavingBanners(false);
    }
  };

  // ── Hero Slide Actions ─────────────────────────────────────────
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: `Slide #${heroSlides.length + 1}`,
      headline: 'NEW HERO COLLECTION',
      highlightText: 'NEW HERO',
      subheading: 'Book the exclusive INFINITO merchandise right now.',
      buttonText: 'Shop Now',
      buttonLink: 'https://shop.infinitohq.com/',
      imageUrl: '/banners/hero_monthly_drop.png',
      displayMode: 'banner_image', // 'banner_image' | 'custom_overlay'
      alignment: 'left',
      variant: 'dark',
      isActive: true,
    };
    const updated = [...heroSlides, newSlide];
    setHeroSlides(updated);
    setPreviewSlideIdx(updated.length - 1);
    message.info('New slide added! Click "Save Hero Slider" to publish.');
  };

  const handleDeleteSlide = (idx) => {
    if (heroSlides.length <= 1) {
      return message.warning('You must keep at least 1 hero slide');
    }
    const updated = heroSlides.filter((_, i) => i !== idx);
    setHeroSlides(updated);
    if (previewSlideIdx >= updated.length) {
      setPreviewSlideIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveSlide = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
    const updated = [...heroSlides];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setHeroSlides(updated);
    setPreviewSlideIdx(targetIdx);
  };

  const handleRestoreUploadedPresets = () => {
    setHeroSlides([
      {
        id: "slide-1",
        title: "Monthly Drop Incoming",
        headline: "MONTHLY DROP INCOMING",
        highlightText: "MONTHLY DROP",
        subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
        buttonText: "Shop Now",
        buttonLink: "https://shop.infinitohq.com/",
        imageUrl: "/banners/hero_monthly_drop.png",
        displayMode: "banner_image",
        alignment: "right",
        variant: "light",
        isActive: true,
      },
      {
        id: "slide-2",
        title: "Become Infinito",
        headline: "BECOME ONE OF US BECOME INFINITO",
        highlightText: "ONE OF US",
        subheading: "Only 500 pieces. Book the exclusive INFINITO merchandise right now.",
        buttonText: "Shop Now",
        buttonLink: "https://shop.infinitohq.com/",
        imageUrl: "/banners/hero_become_infinito.png",
        displayMode: "banner_image",
        alignment: "left",
        variant: "dark",
        isActive: true,
      },
    ]);
    setPreviewSlideIdx(0);
    message.success('Default uploaded hero slides restored! Click "Save Hero Slider" to save.');
  };

  // ── Promo Banner Actions (Multiple!) ───────────────────────────
  const handleAddPromoBanner = () => {
    const newBanner = {
      id: `promo-${Date.now()}`,
      headline: '20% off',
      subtitle: 'on New Comic Drops',
      badgeText: 'SPECIAL OFFER',
      discountCode: 'SPECIAL20',
      buttonText: 'Shop Now',
      buttonLink: 'https://shop.infinitohq.com/',
      bgImageUrl: '/products/crimson_tshirt.jpg',
      bgColor: '#111827',
      textColor: '#ffffff',
      isActive: true,
    };
    const updated = [...promoBanners, newBanner];
    setPromoBanners(updated);
    setPreviewPromoIdx(updated.length - 1);
    message.info('New promo banner added! Click "Save Promo Banners" to publish.');
  };

  const handleDeletePromoBanner = (idx) => {
    if (promoBanners.length <= 1) {
      return message.warning('You must keep at least 1 promo banner');
    }
    const updated = promoBanners.filter((_, i) => i !== idx);
    setPromoBanners(updated);
    if (previewPromoIdx >= updated.length) {
      setPreviewPromoIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleMovePromoBanner = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= promoBanners.length) return;
    const updated = [...promoBanners];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setPromoBanners(updated);
    setPreviewPromoIdx(targetIdx);
  };

  // ── Promo Bar Actions (Multiple!) ──────────────────────────────
  const handleAddPromoBar = () => {
    const newBar = {
      id: `bar-${Date.now()}`,
      text: '🔥 NEW PROMO: FLASH SALE ON ALL APPAREL — USE CODE FLASH20 FOR EXTRA 20% OFF',
      link: 'https://shop.infinitohq.com/',
      bgColor: '#DD1215',
      textColor: '#ffffff',
      isActive: true,
    };
    setPromoBars(prev => [...prev, newBar]);
    message.info('New announcement added! Click "Save Announcement Bars" to publish.');
  };

  const handleDeletePromoBar = (idx) => {
    if (promoBars.length <= 1) {
      return message.warning('You must keep at least 1 announcement bar');
    }
    setPromoBars(prev => prev.filter((_, i) => i !== idx));
  };

  // Filtered discount codes
  const filteredDiscounts = discountCodes.filter((item) => {
    const matchesSearch =
      (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.appliesToDetail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <Spin size="large" />
        <p className="text-gray-500 mt-4 font-medium">Loading marketing & promotions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Shop</span>
            <span>/</span>
            <span className="text-[#DD1215]">Marketing & Promotions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Marketing & Promotions</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create discount codes, automate promotional campaigns, and manage live shop frontend banners.
          </p>
        </div>

        {activeTab === 'discounts' ? (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DD1215] hover:bg-red-700 text-white rounded-lg transition font-bold text-xs shadow-sm cursor-pointer self-start md:self-auto"
          >
            <Plus size={16} />
            <span>Create Discount Code</span>
          </button>
        ) : (
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs shadow-sm cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={14} />
            <span>Sync Content</span>
          </button>
        )}
      </div>

      {/* ── Sub-navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => handleTabChange('discounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'discounts'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <TagIcon size={15} className={activeTab === 'discounts' ? 'text-[#DD1215]' : 'text-gray-400'} />
          <span>Discount Codes</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-gray-200 text-gray-800">
            {discountCodes.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ImageIcon size={15} className={activeTab === 'banners' ? 'text-[#DD1215]' : 'text-gray-400'} />
          <span>Banners & Promotions</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800">
            Shop Frontend Live
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 4.1 DISCOUNT CODES SECTION ──────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Promo Codes</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {discountCodes.filter((d) => d.status === 'Active').length}
                </h3>
                <p className="text-xs text-green-600 font-semibold mt-1">Available for customer checkout</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-50 text-[#DD1215] flex items-center justify-center font-bold">
                <TagIcon size={20} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Redemptions</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">
                  {discountCodes.reduce((sum, d) => sum + (d.usageCount || 0), 0)}
                </h3>
                <p className="text-xs text-blue-700 font-semibold mt-1">Applied across store purchases</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Customer Savings Generated</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  ₹58,450
                </h3>
                <p className="text-xs text-emerald-700 font-semibold mt-1">AOV incentive conversion</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Gift size={20} />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by code (e.g. INFINT10) or scope..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#DD1215]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                {['All', 'Active', 'Scheduled', 'Disabled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* All Discount Codes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount / Value</th>
                    <th className="py-3.5 px-4">Applies To</th>
                    <th className="py-3.5 px-4 text-center">Usage Count</th>
                    <th className="py-3.5 px-4">Active Dates</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDiscounts.map((item) => {
                    const isCopied = copiedCode === item.code;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition">
                        {/* Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm bg-gray-100 text-gray-900 px-2.5 py-1 rounded border border-gray-200">
                              {item.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(item.code)}
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Copy Code"
                            >
                              {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                            {item.type === 'Percentage' ? (
                              <Percent size={13} className="text-blue-600" />
                            ) : item.type === 'Free shipping' ? (
                              <Truck size={13} className="text-emerald-600" />
                            ) : (
                              <DollarSign size={13} className="text-purple-600" />
                            )}
                            {item.type}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-black text-gray-900 whitespace-nowrap">
                          {item.type === 'Percentage'
                            ? `${item.value}% Off`
                            : item.type === 'Free shipping'
                            ? 'FREE SHIPPING'
                            : `₹${item.value} Off`}
                        </td>

                        {/* Applies To */}
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs">
                          <span className="font-semibold block text-gray-800">{item.appliesTo}</span>
                          <span className="text-[10px] text-gray-400 truncate block">
                            {item.appliesToDetail || 'All products'}
                          </span>
                        </td>

                        {/* Usage Count */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="font-bold text-gray-800">
                            {item.usageCount || 0}
                          </span>
                          <span className="text-gray-400 text-[10px] ml-1">
                            / {item.usageLimitTotal ? item.usageLimitTotal : '∞'} uses
                          </span>
                        </td>

                        {/* Active Dates */}
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          <div>From: {item.startDate || 'Immediate'}</div>
                          <div className="text-[10px] text-gray-400">
                            Until: {item.endDate ? item.endDate : 'No expiration'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Tag
                            color={
                              item.status === 'Active'
                                ? 'success'
                                : item.status === 'Scheduled'
                                ? 'processing'
                                : 'default'
                            }
                            className="font-bold uppercase text-[10px] px-2 py-0.5"
                          >
                            {item.status}
                          </Tag>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
                            >
                              {item.status === 'Active' ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-gray-400 hover:text-[#DD1215] hover:bg-gray-100 rounded transition"
                              title="Edit Discount Code"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDiscount(item.id, item.code)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete Discount Code"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── 4.2 BANNERS & PROMOTIONS SECTION ────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'banners' && (
        <div className="space-y-8">
          {/* ══════════════════════════════════════════════════════════ */}
          {/* 1. HERO SLIDER CONTENT (MAIN CAROUSEL)                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Sliders className="text-[#DD1215]" size={17} />
                  Hero Slider Content (Main Carousel)
                </h3>
                <p className="text-xs text-gray-500">
                  Manage full-width responsive slides on the Shop landing page. Supports uploaded visual artwork and text/CTA overlays.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreUploadedPresets}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  title="Reset to the 2 uploaded hero slides"
                >
                  <RefreshCw size={13} className="inline mr-1 text-[#DD1215]" />
                  Uploaded Presets
                </button>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add New Slide
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroSlider}
                  disabled={savingBanners}
                  className="px-4 py-1.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Hero Slider ({heroSlides.length} Slides)
                </button>
              </div>
            </div>

            {/* Live Slider Preview Card */}
            {heroSlides.length > 0 && (
              <div className="space-y-2 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Live Carousel Preview (Slide #{previewSlideIdx + 1} of {heroSlides.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((previewSlideIdx - 1 + heroSlides.length) % heroSlides.length)}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                      title="Previous preview slide"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setPreviewSlideIdx(dotIdx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            previewSlideIdx === dotIdx ? 'w-5 bg-[#DD1215]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                          title={`Preview slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewSlideIdx((previewSlideIdx + 1) % heroSlides.length)}
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                      title="Next preview slide"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {(() => {
                  const currentSlide = heroSlides[previewSlideIdx] || heroSlides[0];
                  const bg = currentSlide?.imageUrl || currentSlide?.image;
                  const isArtworkMode = currentSlide?.displayMode === 'banner_image';

                  return (
                    <div
                      className="relative w-full rounded-xl overflow-hidden border border-gray-300 shadow-md bg-gray-950 aspect-[1024/380] min-h-[340px] sm:min-h-[400px] md:min-h-[460px] flex items-center p-6 md:p-12 text-white bg-cover bg-center transition-all group"
                      style={bg ? { backgroundImage: `url(${bg})` } : undefined}
                    >
                      {/* Left Navigation Arrow */}
                      <button
                        type="button"
                        onClick={() => setPreviewSlideIdx((previewSlideIdx - 1 + heroSlides.length) % heroSlides.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur border border-white/30 flex items-center justify-center text-white transition cursor-pointer"
                        title="Previous slide"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Right Navigation Arrow */}
                      <button
                        type="button"
                        onClick={() => setPreviewSlideIdx((previewSlideIdx + 1) % heroSlides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 backdrop-blur border border-white/30 flex items-center justify-center text-white transition cursor-pointer"
                        title="Next slide"
                      >
                        <ChevronRight size={18} />
                      </button>

                      {/* Bottom Dots Indicator matching storefront in SS1 */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {heroSlides.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setPreviewSlideIdx(dotIdx)}
                            className={`transition-all rounded-full cursor-pointer ${
                              previewSlideIdx === dotIdx ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                            }`}
                            title={`Slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Dark overlay only if in text overlay mode */}
                      {!isArtworkMode && <div className="absolute inset-0 bg-black/50"></div>}

                      {/* When not in artwork mode, render custom text overlays */}
                      {!isArtworkMode && (
                        <div
                          className={`relative z-10 max-w-[65%] space-y-3 ${
                            currentSlide?.alignment === 'right' ? 'ml-auto text-right' : currentSlide?.alignment === 'center' ? 'mx-auto text-center' : 'text-left'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#DD1215] bg-black/60 px-2.5 py-0.5 rounded">
                            Slide #{previewSlideIdx + 1} {currentSlide?.isActive ? '• Active' : '• Inactive'}
                          </span>
                          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider drop-shadow-md text-white font-['Dharma_Gothic_E',_'Bebas_Neue',_sans-serif] leading-tight">
                            {currentSlide?.headline || 'Hero Headline'}
                          </h2>
                          <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-200 font-semibold max-w-md">
                            {currentSlide?.subheading || 'Subheading description text'}
                          </p>
                          <div className="pt-2">
                            <span className="inline-block px-7 py-2.5 bg-[#DD1215] text-white text-xs font-bold uppercase tracking-widest shadow-md transition font-dmsans">
                              {currentSlide?.buttonText || 'Shop Now'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Slide Cards List */}
            <div className="space-y-4">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="p-5 border border-gray-200 rounded-xl bg-gray-50/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900 uppercase">
                        {slide.title || slide.headline || `Slide #${idx + 1}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${slide.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {slide.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                        title="Move slide up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(idx, 1)}
                        disabled={idx === heroSlides.length - 1}
                        className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                        title="Move slide down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(idx)}
                        className="p-1 rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 transition"
                        title="Delete slide"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-3">
                        <span className="text-xs text-gray-600 font-semibold">Active:</span>
                        <Switch
                          checked={slide.isActive}
                          onChange={(chk) => {
                            const updated = [...heroSlides];
                            updated[idx].isActive = chk;
                            setHeroSlides(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Slide Title / Name</label>
                      <Input
                        value={slide.title || ''}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].title = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="e.g. Monthly Drop Incoming"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Display Mode</label>
                      <Select
                        value={slide.displayMode || 'banner_image'}
                        onChange={(val) => {
                          const updated = [...heroSlides];
                          updated[idx].displayMode = val;
                          setHeroSlides(updated);
                        }}
                        className="w-full"
                        options={[
                          { value: 'banner_image', label: 'Full Banner Artwork (Uploaded image direct)' },
                          { value: 'custom_overlay', label: 'Custom Text & CTA Button Overlay' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Text Alignment</label>
                      <Select
                        value={slide.alignment || 'left'}
                        onChange={(val) => {
                          const updated = [...heroSlides];
                          updated[idx].alignment = val;
                          setHeroSlides(updated);
                        }}
                        className="w-full"
                        options={[
                          { value: 'left', label: 'Left Aligned' },
                          { value: 'center', label: 'Centered' },
                          { value: 'right', label: 'Right Aligned' },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Headline Text</label>
                      <Input
                        value={slide.headline || ''}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].headline = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="e.g. BECOME ONE OF US BECOME INFINITO"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Highlight Words (In Brand Red)</label>
                      <Input
                        value={slide.highlightText || ''}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].highlightText = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="e.g. ONE OF US or MONTHLY DROP"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Subheading / Description</label>
                      <Input
                        value={slide.subheading || ''}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].subheading = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="Only 500 pieces. Book the exclusive merchandise right now."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Button Text</label>
                      <Input
                        value={slide.buttonText || 'Shop Now'}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].buttonText = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="e.g. Shop Now"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Button Redirect Link</label>
                      <Input
                        value={slide.buttonLink || 'https://shop.infinitohq.com/'}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].buttonLink = e.target.value;
                          setHeroSlides(updated);
                        }}
                        placeholder="https://shop.infinitohq.com/ or /shop/catalog"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Banner Slide Image (URL or Upload)</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={slide.imageUrl || slide.image || ''}
                          onChange={(e) => {
                            const updated = [...heroSlides];
                            updated[idx].imageUrl = e.target.value;
                            updated[idx].image = e.target.value;
                            setHeroSlides(updated);
                          }}
                          placeholder="e.g. /banners/hero_monthly_drop.png or /banners/hero_become_infinito.png or upload"
                        />
                        <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer whitespace-nowrap">
                          Browse
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const updated = [...heroSlides];
                                  updated[idx].imageUrl = reader.result;
                                  updated[idx].image = reader.result;
                                  setHeroSlides(updated);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {(slide.imageUrl || slide.image) && (
                        <div className="mt-2 h-20 w-48 rounded border border-gray-300 overflow-hidden bg-gray-900 shadow-xs flex items-center justify-center">
                          <img
                            src={slide.imageUrl || slide.image}
                            alt={`Slide ${idx + 1} artwork`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 2. HOMEPAGE PROMO BANNERS (MULTIPLE ALLOWED!)               */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="text-[#DD1215]" size={17} />
                  Homepage Promo Banners (e.g. 35% Off Banner)
                </h3>
                <p className="text-xs text-gray-500">
                  Controls promotional campaign banners placed between hero and categories. You can create multiple banners!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddPromoBanner}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Promo Banner
                </button>
                <button
                  type="button"
                  onClick={handleSavePromoBanners}
                  disabled={savingBanners}
                  className="px-4 py-1.5 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Promo Banners ({promoBanners.length} Total)
                </button>
              </div>
            </div>

            {/* Live Promo Banner Preview */}
            {promoBanners.length > 0 && (
              <div className="space-y-2 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Live Preview (Banner #{previewPromoIdx + 1} of {promoBanners.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    {promoBanners.map((_, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setPreviewPromoIdx(pIdx)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          previewPromoIdx === pIdx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        #{pIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const currentPromo = promoBanners[previewPromoIdx] || promoBanners[0];
                  return (
                    <div className="flex items-center justify-center gap-3 md:gap-5 py-4 bg-gray-50/60 rounded-xl border border-gray-200">
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewPromoIdx((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)}
                        className="w-9 h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
                        title="Previous Banner"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {/* Exact SS2 Sized Banner Preview */}
                      <div
                        className="relative w-full max-w-[780px] h-[160px] sm:h-[175px] md:h-[180px] rounded-xl overflow-hidden border border-gray-300 shadow-md flex items-center bg-black bg-cover bg-center shrink-0"
                        style={{
                          backgroundColor: currentPromo?.bgColor || '#800000',
                          backgroundImage: currentPromo?.bgImageUrl ? `url(${currentPromo.bgImageUrl})` : undefined,
                          color: currentPromo?.textColor || '#ffffff',
                        }}
                      >
                        {/* Gradient overlay to maintain text readability while artwork remains bright */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />

                        {/* Content matching SS2 */}
                        <div className="relative z-10 pl-6 sm:pl-8 md:pl-10 max-w-[65%] sm:max-w-[55%] space-y-1 text-white">
                          {(currentPromo?.badgeText || currentPromo?.discountCode) && (
                            <span className="inline-block bg-black/70 text-[#DD1215] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                              {currentPromo.badgeText || currentPromo.discountCode}
                            </span>
                          )}
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow">
                            {currentPromo?.headline || '35% off'}
                          </h2>
                          <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-gray-200 uppercase drop-shadow">
                            {currentPromo?.subtitle || 'on The Crimson Bloodline'}
                          </p>
                          <div className="pt-2">
                            <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-[#DD1215] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                              {currentPromo?.buttonText || 'Buy Now'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewPromoIdx((prev) => (prev + 1) % promoBanners.length)}
                        className="w-9 h-9 bg-white border border-gray-300 rounded hover:border-gray-500 hover:text-black text-gray-500 flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
                        title="Next Banner"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Promo Banner Cards */}
            <div className="space-y-4">
              {promoBanners.map((promo, idx) => (
                <div key={promo.id || idx} className="p-5 border border-gray-200 rounded-xl bg-gray-50/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900 uppercase">
                        {promo.headline} {promo.subtitle}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMovePromoBanner(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                        title="Move banner up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePromoBanner(idx, 1)}
                        disabled={idx === promoBanners.length - 1}
                        className="p-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                        title="Move banner down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePromoBanner(idx)}
                        className="p-1 rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 transition"
                        title="Delete banner"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-3">
                        <span className="text-xs text-gray-600 font-semibold">Active:</span>
                        <Switch
                          checked={promo.isActive}
                          onChange={(chk) => {
                            const updated = [...promoBanners];
                            updated[idx].isActive = chk;
                            setPromoBanners(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Headline Text</label>
                      <Input
                        value={promo.headline || ''}
                        onChange={(e) => {
                          const updated = [...promoBanners];
                          updated[idx].headline = e.target.value;
                          setPromoBanners(updated);
                        }}
                        placeholder="e.g. 35% off"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Subtitle / Target Collection</label>
                      <Input
                        value={promo.subtitle || ''}
                        onChange={(e) => {
                          const updated = [...promoBanners];
                          updated[idx].subtitle = e.target.value;
                          setPromoBanners(updated);
                        }}
                        placeholder="e.g. on The Crimson Bloodline"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Badge / Discount Code</label>
                      <Input
                        value={promo.discountCode || promo.badgeText || ''}
                        onChange={(e) => {
                          const updated = [...promoBanners];
                          updated[idx].discountCode = e.target.value;
                          updated[idx].badgeText = e.target.value;
                          setPromoBanners(updated);
                        }}
                        placeholder="e.g. CRIMSON35"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">CTA Button Text</label>
                      <Input
                        value={promo.buttonText || 'Buy Now'}
                        onChange={(e) => {
                          const updated = [...promoBanners];
                          updated[idx].buttonText = e.target.value;
                          setPromoBanners(updated);
                        }}
                        placeholder="e.g. Buy Now"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 uppercase mb-1">CTA Link URL</label>
                      <Input
                        value={promo.buttonLink || 'https://shop.infinitohq.com/'}
                        onChange={(e) => {
                          const updated = [...promoBanners];
                          updated[idx].buttonLink = e.target.value;
                          setPromoBanners(updated);
                        }}
                        placeholder="https://shop.infinitohq.com/ or /shop/catalog"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Background Image (URL or Upload)</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={promo.bgImageUrl || ''}
                          onChange={(e) => {
                            const updated = [...promoBanners];
                            updated[idx].bgImageUrl = e.target.value;
                            setPromoBanners(updated);
                          }}
                          placeholder="e.g. /products/crimson_tshirt.jpg or pick file"
                        />
                        <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700 font-bold text-xs cursor-pointer whitespace-nowrap">
                          Browse
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const updated = [...promoBanners];
                                  updated[idx].bgImageUrl = reader.result;
                                  setPromoBanners(updated);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Theme Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={promo.bgColor || '#800000'}
                          onChange={(e) => {
                            const updated = [...promoBanners];
                            updated[idx].bgColor = e.target.value;
                            setPromoBanners(updated);
                          }}
                          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <Input
                          value={promo.bgColor || '#800000'}
                          onChange={(e) => {
                            const updated = [...promoBanners];
                            updated[idx].bgColor = e.target.value;
                            setPromoBanners(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 3. TOP PROMO / ANNOUNCEMENT BAR (MULTIPLE ALLOWED!)         */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Palette className="text-[#DD1215]" size={17} />
                  Top Promo / Announcement Bar
                </h3>
                <p className="text-xs text-gray-500">
                  Global header ticker displayed at the very top of the customer website. You can create multiple announcements that rotate on the frontend!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddPromoBar}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Announcement
                </button>
                <button
                  type="button"
                  onClick={handleSavePromoBars}
                  disabled={savingBanners}
                  className="px-4 py-1.5 bg-[#DD1215] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                >
                  Save Announcement Bars ({promoBars.length} Total)
                </button>
              </div>
            </div>

            {/* Live Preview Ticker */}
            {promoBars.length > 0 && (
              <div className="space-y-2 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Live Header Preview (Announcement #{previewBarIdx + 1} of {promoBars.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    {promoBars.map((_, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => setPreviewBarIdx(bIdx)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          previewBarIdx === bIdx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        #{bIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const currentBar = promoBars[previewBarIdx] || promoBars[0];
                  return (
                    <div
                      style={{
                        backgroundColor: currentBar?.bgColor || '#DD1215',
                        color: currentBar?.textColor || '#ffffff',
                      }}
                      className="w-full py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>{currentBar?.text || 'Announcement text here'}</span>
                      <ExternalLink size={12} className="opacity-70" />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Announcement Bars List */}
            <div className="space-y-3">
              {promoBars.map((bar, idx) => (
                <div key={bar.id || idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/70 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold text-xs text-gray-800 uppercase flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Announcement #{idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePromoBar(idx)}
                        className="p-1 rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 transition"
                        title="Delete announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                        <span className="text-xs text-gray-600 font-semibold">Active:</span>
                        <Switch
                          checked={bar.isActive}
                          onChange={(chk) => {
                            const updated = [...promoBars];
                            updated[idx].isActive = chk;
                            setPromoBars(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-700 uppercase mb-1">Announcement Text</label>
                      <Input
                        value={bar.text || ''}
                        onChange={(e) => {
                          const updated = [...promoBars];
                          updated[idx].text = e.target.value;
                          setPromoBars(updated);
                        }}
                        placeholder="e.g. FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹999 | USE CODE INFINITO"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Target Link URL</label>
                      <Input
                        value={bar.link || 'https://shop.infinitohq.com/'}
                        onChange={(e) => {
                          const updated = [...promoBars];
                          updated[idx].link = e.target.value;
                          setPromoBars(updated);
                        }}
                        placeholder="https://shop.infinitohq.com/"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">Background Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={bar.bgColor || '#DD1215'}
                          onChange={(e) => {
                            const updated = [...promoBars];
                            updated[idx].bgColor = e.target.value;
                            setPromoBars(updated);
                          }}
                          className="w-7 h-7 rounded border border-gray-300 cursor-pointer shrink-0"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...promoBars];
                            updated[idx].bgColor = '#DD1215';
                            setPromoBars(updated);
                          }}
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                          title="Infinito Red"
                        >
                          Red
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...promoBars];
                            updated[idx].bgColor = '#0f172a';
                            setPromoBars(updated);
                          }}
                          className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-bold"
                          title="Dark Slate"
                        >
                          Dark
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT DISCOUNT CODE MODAL ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <TagIcon className="text-[#DD1215]" size={20} />
            <span>{editingDiscountId ? 'Edit Discount Code' : 'Create New Discount Code'}</span>
          </div>
        }
        open={discountModalOpen}
        onOk={handleSaveDiscount}
        okText={editingDiscountId ? 'Update Discount' : 'Create Discount'}
        okButtonProps={{ className: 'bg-[#DD1215] hover:bg-red-700' }}
        onCancel={() => setDiscountModalOpen(false)}
        width={560}
      >
        <div className="space-y-4 py-2 text-xs">
          {/* Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700 uppercase">Discount Code</label>
              <button
                type="button"
                onClick={handleAutoGenerateCode}
                className="text-[#DD1215] hover:underline font-semibold"
              >
                Auto Generate Code
              </button>
            </div>
            <Input
              value={discountFormData.code}
              onChange={(e) => setDiscountFormData({ ...discountFormData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. INFINT10"
              className="font-mono font-bold text-sm"
            />
            <p className="text-gray-400 mt-1">Customers will enter this exact code at checkout.</p>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Discount Type</label>
            <Radio.Group
              value={discountFormData.type}
              onChange={(e) => setDiscountFormData({ ...discountFormData, type: e.target.value })}
              className="w-full"
            >
              <div className="grid grid-cols-3 gap-2">
                <Radio.Button value="Percentage" className="text-center font-bold">
                  Percentage (%)
                </Radio.Button>
                <Radio.Button value="Fixed amount" className="text-center font-bold">
                  Fixed Amount (₹)
                </Radio.Button>
                <Radio.Button value="Free shipping" className="text-center font-bold">
                  Free Shipping
                </Radio.Button>
              </div>
            </Radio.Group>
          </div>

          {/* Discount Value */}
          {discountFormData.type !== 'Free shipping' && (
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Discount Value {discountFormData.type === 'Percentage' ? '(%)' : '(₹)'}
              </label>
              <InputNumber
                min={1}
                max={discountFormData.type === 'Percentage' ? 100 : 50000}
                value={discountFormData.value}
                onChange={(val) => setDiscountFormData({ ...discountFormData, value: val })}
                className="w-full"
                prefix={discountFormData.type === 'Percentage' ? '%' : '₹'}
              />
            </div>
          )}

          {/* Applies To */}
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Applies To</label>
            <Select
              value={discountFormData.appliesTo}
              onChange={(val) => setDiscountFormData({ ...discountFormData, appliesTo: val })}
              className="w-full"
              options={[
                { value: 'All products', label: 'All products' },
                { value: 'Specific collections', label: 'Specific collections (e.g. The Crimson Bloodline)' },
                { value: 'Specific products', label: 'Specific products' },
              ]}
            />
          </div>

          {/* Minimum Purchase */}
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Minimum Purchase Amount (₹)
            </label>
            <InputNumber
              min={0}
              value={discountFormData.minPurchase}
              onChange={(val) => setDiscountFormData({ ...discountFormData, minPurchase: val })}
              className="w-full"
              placeholder="0 for no minimum"
              prefix="₹"
            />
          </div>

          {/* Usage Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Total Usage Limit</label>
              <InputNumber
                min={1}
                value={discountFormData.usageLimitTotal}
                onChange={(val) => setDiscountFormData({ ...discountFormData, usageLimitTotal: val })}
                className="w-full"
                placeholder="e.g. 500 uses"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={discountFormData.onePerCustomer}
                  onChange={(e) => setDiscountFormData({ ...discountFormData, onePerCustomer: e.target.checked })}
                  className="rounded text-[#DD1215]"
                />
                Limit to 1 use per customer
              </label>
            </div>
          </div>

          {/* Active Dates */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-700 uppercase">Active Dates</label>
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-600">
                <input
                  type="checkbox"
                  checked={discountFormData.neverExpires}
                  onChange={(e) => setDiscountFormData({ ...discountFormData, neverExpires: e.target.checked })}
                />
                Never expires
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-400 block mb-0.5">Start Date</span>
                <input
                  type="date"
                  value={discountFormData.startDate}
                  onChange={(e) => setDiscountFormData({ ...discountFormData, startDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                />
              </div>
              {!discountFormData.neverExpires && (
                <div>
                  <span className="text-gray-400 block mb-0.5">End Date</span>
                  <input
                    type="date"
                    value={discountFormData.endDate}
                    onChange={(e) => setDiscountFormData({ ...discountFormData, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarketingDashboard;
