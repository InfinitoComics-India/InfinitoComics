import React, { useState, useEffect } from 'react';
import {
  Building2, Landmark, Receipt, FileText, Globe, Phone, Mail,
  MapPin, CheckCircle2, Save, RefreshCw, ShieldCheck, CreditCard,
  Copy, Check, ExternalLink, Sparkles, AlertCircle, HelpCircle
} from 'lucide-react';
import { message, Spin, Tooltip } from 'antd';
import { fetchCompanyProfile, saveCompanyProfile } from '../../services/shopServices/companyProfileService';

const DEFAULT_PROFILE = {
  companyName: 'Infinito Comics Private Limited',
  brandName: 'Infinito Comics',
  tagline: "India's Premier Universe of Graphic Fiction & Comics",
  logoUrl: '',
  website: 'https://infinitocomics.com',
  gstNumber: '',
  panNumber: '',
  cinNumber: '',
  tanNumber: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  },
  contact: {
    email: 'contact@infinitohq.com',
    billingEmail: 'billing@infinitohq.com',
    phone: '',
    supportPhone: '',
  },
  bankDetails: {
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'Current Account',
    upiId: '',
  },
  invoiceSettings: {
    invoicePrefix: 'INF-INV-',
    authorizedSignatory: '',
    termsAndConditions: 'Thank you for shopping with Infinito Comics. Goods once sold can be replaced in case of manufacturing defects within 7 days.',
    footerNote: 'This is a computer generated invoice and does not require physical signature.',
  },
};

const CompanyProfile = () => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [copiedKey, setCopiedKey] = useState(null);

  // Load company profile from backend
  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyProfile();
      if (data) {
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          address: { ...DEFAULT_PROFILE.address, ...(data.address || {}) },
          contact: { ...DEFAULT_PROFILE.contact, ...(data.contact || {}) },
          bankDetails: { ...DEFAULT_PROFILE.bankDetails, ...(data.bankDetails || {}) },
          invoiceSettings: { ...DEFAULT_PROFILE.invoiceSettings, ...(data.invoiceSettings || {}) },
        });
      }
    } catch (err) {
      console.error('Error loading company profile:', err);
      message.error('Failed to load company profile from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle nested field changes
  const handleNestedChange = (section, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle root field changes
  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    message.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Save form
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!profile.companyName.trim()) {
      message.error('Company Legal Name is required');
      return;
    }

    try {
      setSaving(true);
      const updated = await saveCompanyProfile(profile);
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          ...updated,
          address: { ...prev.address, ...(updated.address || {}) },
          contact: { ...prev.contact, ...(updated.contact || {}) },
          bankDetails: { ...prev.bankDetails, ...(updated.bankDetails || {}) },
          invoiceSettings: { ...prev.invoiceSettings, ...(updated.invoiceSettings || {}) },
        }));
      }
      message.success('Company profile updated successfully!');
    } catch (err) {
      console.error('Error saving company profile:', err);
      message.error(err?.response?.data?.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'general', label: 'Company & Brand', icon: Building2 },
    { id: 'tax', label: 'Tax & Legal (GST/PAN)', icon: ShieldCheck },
    { id: 'bank', label: 'Bank & Settlement', icon: Landmark },
    { id: 'address', label: 'Address & Contact', icon: MapPin },
    { id: 'invoice', label: 'Invoice & Billing', icon: Receipt },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-gray-500 text-sm font-semibold">Loading Company Profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-[#DD1215] flex items-center justify-center">
              <Building2 size={18} />
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-dmsans">
              Company Profile
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Manage your legal entity, brand identities, GST, PAN, bank settlement accounts, registered office address, and customer invoice preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadProfile}
            disabled={loading || saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#DD1215]' : ''} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#DD1215] hover:bg-[#b00f12] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Quick Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Brand Name</p>
            <h4 className="text-sm font-black text-gray-900 mt-0.5 truncate">{profile.brandName || 'Infinito'}</h4>
            <p className="text-[11px] text-gray-500 truncate">{profile.companyName || 'Entity'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DD1215] flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
        </div>

        {/* GST Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">GSTIN</p>
            <h4 className="text-sm font-black text-gray-900 mt-0.5 font-mono truncate">
              {profile.gstNumber || 'Not Configured'}
            </h4>
            <p className="text-[11px] text-emerald-600 font-bold">
              {profile.gstNumber ? 'Verified Tax ID' : 'Pending Update'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Bank Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Settlement Bank</p>
            <h4 className="text-sm font-black text-gray-900 mt-0.5 truncate">
              {profile.bankDetails?.bankName || 'No Bank Added'}
            </h4>
            <p className="text-[11px] text-gray-500 font-mono truncate">
              {profile.bankDetails?.accountNumber
                ? `•••• ${profile.bankDetails.accountNumber.slice(-4)}`
                : 'A/C Pending'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Landmark size={20} />
          </div>
        </div>

        {/* Invoice Prefix Card */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Invoice Prefix</p>
            <h4 className="text-sm font-black text-gray-900 mt-0.5 font-mono truncate">
              {profile.invoiceSettings?.invoicePrefix || 'INF-INV-'}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">Customer Orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Receipt size={20} />
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'border-[#DD1215] text-[#DD1215] bg-white shadow-xs'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="p-6">
          {/* ════ TAB 1: GENERAL & BRAND ════ */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Building2 size={18} className="text-[#DD1215]" />
                  <span>Company & Brand Information</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Core identity details of your registered enterprise and commercial brand.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Company Registered Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="e.g. Infinito Comics Private Limited"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Official legal entity name registered under MCA / Registrar.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Brand / Trade Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.brandName}
                    onChange={(e) => handleChange('brandName', e.target.value)}
                    placeholder="e.g. Infinito Comics"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Name displayed across the store, packages, and communications.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Company Tagline / Bio
                  </label>
                  <input
                    type="text"
                    value={profile.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="e.g. India's Premier Universe of Graphic Fiction & Comics"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Official Website URL
                  </label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://infinitocomics.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Brand Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={profile.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://res.cloudinary.com/.../logo.png"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>
              </div>

              {/* Logo Preview */}
              {profile.logoUrl && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-4">
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo Preview"
                    className="w-16 h-16 object-contain bg-white p-1 rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">Logo Live Preview</h5>
                    <p className="text-[11px] text-gray-500">
                      This logo will appear on invoice headers and customer order receipts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB 2: TAX & LEGAL ════ */}
          {activeTab === 'tax' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#DD1215]" />
                  <span>Tax & Regulatory Identifiers</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Government tax numbers and incorporation codes for legal business compliance in India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GST Number */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      GST Identification Number (GSTIN)
                    </label>
                    {profile.gstNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.gstNumber, 'gst')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'gst' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'gst' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.gstNumber}
                    onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500">15-digit Goods and Services Tax Identification Number.</p>
                </div>

                {/* PAN Number */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Company PAN Number
                    </label>
                    {profile.panNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.panNumber, 'pan')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'pan' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'pan' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.panNumber}
                    onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. AABBC1234D"
                    maxLength={10}
                    className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500">10-character Permanent Account Number issued by Income Tax Dept.</p>
                </div>

                {/* CIN Number */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Corporate Identity Number (CIN)
                    </label>
                    {profile.cinNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.cinNumber, 'cin')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'cin' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'cin' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.cinNumber}
                    onChange={(e) => handleChange('cinNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. U72900KA2023PTC123456"
                    className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500">21-digit unique number assigned by Registrar of Companies (ROC).</p>
                </div>

                {/* TAN Number */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800">
                      Tax Deduction Account Number (TAN)
                    </label>
                    {profile.tanNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.tanNumber, 'tan')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'tan' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'tan' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.tanNumber}
                    onChange={(e) => handleChange('tanNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. BLRR12345A"
                    maxLength={10}
                    className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                  />
                  <p className="text-[10px] text-gray-500">Required for TDS compliance and tax deductions.</p>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 3: BANK & SETTLEMENT ════ */}
          {activeTab === 'bank' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Landmark size={18} className="text-[#DD1215]" />
                  <span>Bank Account & Settlement Details</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Official bank accounts for payment gateways, offline NEFT/RTGS wire transfers, and retail customer settlements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={profile.bankDetails?.bankName}
                    onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                    placeholder="e.g. HDFC Bank / ICICI Bank"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Account Beneficiary / Holder Name
                  </label>
                  <input
                    type="text"
                    value={profile.bankDetails?.accountHolder}
                    onChange={(e) => handleNestedChange('bankDetails', 'accountHolder', e.target.value)}
                    placeholder="e.g. Infinito Comics Private Limited"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Bank Account Number
                    </label>
                    {profile.bankDetails?.accountNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.bankDetails.accountNumber, 'acct')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'acct' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'acct' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.bankDetails?.accountNumber}
                    onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)}
                    placeholder="e.g. 50200012345678"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      IFSC Code
                    </label>
                    {profile.bankDetails?.ifscCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.bankDetails.ifscCode, 'ifsc')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'ifsc' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'ifsc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.bankDetails?.ifscCode}
                    onChange={(e) => handleNestedChange('bankDetails', 'ifscCode', e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full px-3 py-2 text-xs font-mono uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Branch Name & Location
                  </label>
                  <input
                    type="text"
                    value={profile.bankDetails?.branchName}
                    onChange={(e) => handleNestedChange('bankDetails', 'branchName', e.target.value)}
                    placeholder="e.g. Koramangala 5th Block Branch"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={profile.bankDetails?.accountType}
                    onChange={(e) => handleNestedChange('bankDetails', 'accountType', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                  >
                    <option value="Current Account">Current Account</option>
                    <option value="Savings Account">Savings Account</option>
                    <option value="Cash Credit Account">Cash Credit (CC) Account</option>
                    <option value="Overdraft Account">Overdraft (OD) Account</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      Official UPI ID / VPA
                    </label>
                    {profile.bankDetails?.upiId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.bankDetails.upiId, 'upi')}
                        className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'upi' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={profile.bankDetails?.upiId}
                    onChange={(e) => handleNestedChange('bankDetails', 'upiId', e.target.value)}
                    placeholder="e.g. infinitocomics@hdfcbank"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Can be printed on physical QR code invoices for direct UPI payments.</p>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 4: ADDRESS & CONTACT ════ */}
          {activeTab === 'address' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-[#DD1215]" />
                  <span>Registered Address & Contact Directory</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Office address printed on tax invoices, shipping labels, and official customer support contacts.
                </p>
              </div>

              {/* Address Fields */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Registered Business Premises</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Street Address / Building / Unit
                    </label>
                    <input
                      type="text"
                      value={profile.address?.street}
                      onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                      placeholder="e.g. Infinito Headquarters, Plot 42, Outer Ring Road"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={profile.address?.city}
                      onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      State / Union Territory
                    </label>
                    <input
                      type="text"
                      value={profile.address?.state}
                      onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      PIN Code / Postal Code
                    </label>
                    <input
                      type="text"
                      value={profile.address?.pincode}
                      onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                      placeholder="e.g. 560103"
                      maxLength={10}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profile.address?.country}
                      onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                      placeholder="India"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Contact & Support Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Official Contact Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.contact?.email}
                        onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                        placeholder="contact@infinitohq.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Billing & Accounts Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="email"
                        value={profile.contact?.billingEmail}
                        onChange={(e) => handleNestedChange('contact', 'billingEmail', e.target.value)}
                        placeholder="billing@infinitohq.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Primary Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.contact?.phone}
                        onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Customer Support Helpline
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.contact?.supportPhone}
                        onChange={(e) => handleNestedChange('contact', 'supportPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ TAB 5: INVOICE & BILLING ════ */}
          {activeTab === 'invoice' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Receipt size={18} className="text-[#DD1215]" />
                  <span>Invoice & Billing Preferences</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Customize the format, numbering sequences, and legal disclaimers printed on customer tax invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Invoice Series Prefix
                  </label>
                  <input
                    type="text"
                    value={profile.invoiceSettings?.invoicePrefix}
                    onChange={(e) => handleNestedChange('invoiceSettings', 'invoicePrefix', e.target.value)}
                    placeholder="e.g. INF-INV- or IC-2026-"
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">E.g., if prefix is &quot;INF-INV-&quot;, invoice will be INF-INV-000101.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Authorized Signatory Name / Title
                  </label>
                  <input
                    type="text"
                    value={profile.invoiceSettings?.authorizedSignatory}
                    onChange={(e) => handleNestedChange('invoiceSettings', 'authorizedSignatory', e.target.value)}
                    placeholder="e.g. Director / Authorized Finance Officer"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Designation printed at the bottom of tax invoices.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Invoice Terms & Conditions
                  </label>
                  <textarea
                    rows={3}
                    value={profile.invoiceSettings?.termsAndConditions}
                    onChange={(e) => handleNestedChange('invoiceSettings', 'termsAndConditions', e.target.value)}
                    placeholder="Standard terms and conditions printed on invoices..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Invoice Footer Note / Computer Generated Disclaimer
                  </label>
                  <input
                    type="text"
                    value={profile.invoiceSettings?.footerNote}
                    onChange={(e) => handleNestedChange('invoiceSettings', 'footerNote', e.target.value)}
                    placeholder="e.g. This is a computer generated invoice and does not require physical signature."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-[#DD1215] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {profile.updatedBy ? `Last updated by ${profile.updatedBy}` : 'All changes are saved to the master company profile database.'}
            </span>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#DD1215] hover:bg-[#b00f12] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
