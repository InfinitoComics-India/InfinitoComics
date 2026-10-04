import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tag as TagIcon, Plus, Search, Edit3, Trash2, Copy, Check,
  Sparkles, Sliders, Image as ImageIcon, ExternalLink, RefreshCw,
  Eye, CheckCircle2, Clock, XCircle, AlertCircle, Percent,
  DollarSign, Truck, Gift, Palette, ArrowRight
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

  // Banner Edit State
  const [promoBannerForm, setPromoBannerForm] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [promoBarForm, setPromoBarForm] = useState(null);
  const [savingBanners, setSavingBanners] = useState(false);

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
      setPromoBannerForm({ ...banners.promoBanner });
      setHeroSlides([...banners.heroSlider]);
      setPromoBarForm({ ...banners.promoBar });
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

  // ── Banner Save Handlers ─────────────────────────────────────
  const handleSavePromoBanner = async () => {
    try {
      setSavingBanners(true);
      await updatePromoBanner(promoBannerForm);
      message.success('Homepage Promo Banner saved and integrated with Shop frontend!');
    } catch (err) {
      message.error('Failed to save banner');
    } finally {
      setSavingBanners(false);
    }
  };

  const handleSaveHeroSlider = async () => {
    try {
      setSavingBanners(true);
      await updateHeroSlider(heroSlides);
      message.success('Hero Slider content saved and synced with Shop frontend!');
    } catch (err) {
      message.error('Failed to save hero slider');
    } finally {
      setSavingBanners(false);
    }
  };

  const handleSavePromoBar = async () => {
    try {
      setSavingBanners(true);
      await updatePromoBar(promoBarForm);
      message.success('Announcement Bar saved and live on Shop frontend!');
    } catch (err) {
      message.error('Failed to save promo bar');
    } finally {
      setSavingBanners(false);
    }
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
            <span className="text-[#DD1215]">Section 4: Marketing & Promotions</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Marketing & Promotions</span>
            <span className="text-sm px-2.5 py-0.5 bg-red-100 text-[#DD1215] rounded-full font-bold">
              🎨 SECTION 4
            </span>
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
          <span>4.1 Discount Codes</span>
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
          <span>4.2 Banners & Promotions</span>
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
          {/* Sub-section 1: Manage Homepage Promo Banner (35% off on The Crimson Bloodline) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="text-[#DD1215]" size={17} />
                  Homepage Promo Banner (e.g. 35% Off Banner)
                </h3>
                <p className="text-xs text-gray-500">
                  Controls the prominent full-width banner between hero and categories on the Shop homepage
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Active on Shop:</span>
                  <Switch
                    checked={promoBannerForm?.isActive}
                    onChange={(checked) => setPromoBannerForm({ ...promoBannerForm, isActive: checked })}
                  />
                </div>
                <button
                  onClick={handleSavePromoBanner}
                  disabled={savingBanners}
                  className="px-4 py-2 bg-[#DD1215] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Promo Banner
                </button>
              </div>
            </div>

            {/* Two-column layout: Form settings + Live preview card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Settings Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Headline Text</label>
                  <Input
                    value={promoBannerForm?.headline}
                    onChange={(e) => setPromoBannerForm({ ...promoBannerForm, headline: e.target.value })}
                    placeholder="e.g. 35% off"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Subtitle / Target Collection</label>
                  <Input
                    value={promoBannerForm?.subtitle}
                    onChange={(e) => setPromoBannerForm({ ...promoBannerForm, subtitle: e.target.value })}
                    placeholder="e.g. on The Crimson Bloodline"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">CTA Button Text</label>
                    <Input
                      value={promoBannerForm?.buttonText}
                      onChange={(e) => setPromoBannerForm({ ...promoBannerForm, buttonText: e.target.value })}
                      placeholder="e.g. Buy Now"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">CTA Link URL</label>
                    <Input
                      value={promoBannerForm?.buttonLink}
                      onChange={(e) => setPromoBannerForm({ ...promoBannerForm, buttonLink: e.target.value })}
                      placeholder="/shop/catalog"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Attached Discount Code</label>
                  <Select
                    value={promoBannerForm?.discountCode}
                    onChange={(val) => setPromoBannerForm({ ...promoBannerForm, discountCode: val })}
                    className="w-full"
                    options={discountCodes.map((d) => ({
                      value: d.code,
                      label: `${d.code} (${d.type === 'Percentage' ? `${d.value}% Off` : d.type})`,
                    }))}
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Live Shop Homepage Preview
                </span>
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-300 shadow-md bg-gray-900 min-h-[170px] flex items-center p-6 text-white">
                  <div className="relative z-10 max-w-[70%] space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#DD1215] bg-black/40 px-2 py-0.5 rounded">
                      {promoBannerForm?.discountCode || 'PROMO'}
                    </span>
                    <h2 className="text-3xl font-black uppercase tracking-wider drop-shadow-md">
                      {promoBannerForm?.headline || '35% off'}
                    </h2>
                    <p className="text-xs uppercase tracking-wide text-gray-200">
                      {promoBannerForm?.subtitle || 'on The Crimson Bloodline'}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block px-4 py-1.5 bg-[#DD1215] text-white text-xs font-bold uppercase tracking-wide shadow-sm">
                        {promoBannerForm?.buttonText || 'Buy Now'}
                      </span>
                    </div>
                  </div>
                  {/* Background graphic simulation */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-red-600/30 to-transparent pointer-events-none"></div>
                </div>
                <p className="text-[11px] text-gray-400 text-center">
                  Preview mirrors exact CSS, fonts, and responsiveness from <code>ShopMain.jsx</code>
                </p>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Hero Slider Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Sliders className="text-[#DD1215]" size={17} />
                  Hero Slider Content (Main Carousel)
                </h3>
                <p className="text-xs text-gray-500">
                  Manage headline slides on the Shop landing page
                </p>
              </div>

              <button
                onClick={handleSaveHeroSlider}
                disabled={savingBanners}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
              >
                Save Hero Slider
              </button>
            </div>

            <div className="space-y-4">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-gray-800 uppercase">
                      Slide #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">Active:</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Headline</label>
                      <Input
                        value={slide.headline}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].headline = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Subheading</label>
                      <Input
                        value={slide.subheading}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].subheading = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Button Text</label>
                      <Input
                        value={slide.buttonText}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].buttonText = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">Button Link</label>
                      <Input
                        value={slide.buttonLink}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].buttonLink = e.target.value;
                          setHeroSlides(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Promo Banner Content (Announcement Bar) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Palette className="text-[#DD1215]" size={17} />
                  Top Promo / Announcement Bar
                </h3>
                <p className="text-xs text-gray-500">
                  Global header ticker displayed at the very top of the customer store
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={promoBarForm?.isActive}
                  onChange={(chk) => setPromoBarForm({ ...promoBarForm, isActive: chk })}
                />
                <button
                  onClick={handleSavePromoBar}
                  className="px-4 py-1.5 bg-[#DD1215] text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
                >
                  Save Promo Bar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1">Announcement Text</label>
                <Input
                  value={promoBarForm?.text}
                  onChange={(e) => setPromoBarForm({ ...promoBarForm, text: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Target Link</label>
                <Input
                  value={promoBarForm?.link}
                  onChange={(e) => setPromoBarForm({ ...promoBarForm, link: e.target.value })}
                />
              </div>
            </div>

            {/* Live Preview Ticker */}
            <div className="mt-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Live Header Preview</span>
              <div
                style={{ backgroundColor: promoBarForm?.bgColor || '#DD1215', color: promoBarForm?.textColor || '#ffffff' }}
                className="w-full py-2 px-4 text-center text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs"
              >
                {promoBarForm?.text || 'Announcement text here'}
              </div>
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
