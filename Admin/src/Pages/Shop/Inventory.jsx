import React, { useState, useEffect } from 'react';
import {
  Search, AlertTriangle, AlertCircle, TrendingUp,
  Package, Download, Edit2, RefreshCw,
} from 'lucide-react';
import {
  getAllInventory,
  updateInventoryStock,
  exportInventoryReport,
} from '../../services/shopServices/inventoryService';
import { BACKEND_URL } from '../../Utils/constant';
import Swal from 'sweetalert2';

// Handle any of the response shapes our services return.
const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

// Uploaded images arrive as "/uploads/shop/xxx.png" — prepend backend host.
const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = BACKEND_URL?.replace(/\/$/, '') || '';
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

// Backend `Product` docs are what /shop/inventory returns. Map each doc to
// the flat shape this page renders, with safe defaults so a missing field
// (missing category, no images, etc.) never crashes the render.
const mapProduct = (p) => {
  const stock = Number.isFinite(p.stock) ? p.stock : 0;
  const reserved = Number.isFinite(p.reservedStock) ? p.reservedStock : 0;
  const cost = Number.isFinite(p.costPrice) ? p.costPrice : 0;
  const stockStatus =
    stock === 0 ? 'out_of_stock' : stock <= 10 ? 'low_stock' : 'in_stock';

  const primaryImage = Array.isArray(p.images)
    ? (p.images.find((i) => i?.isPrimary) || p.images[0])?.url || ''
    : '';

  return {
    _id: p._id,
    productName: p.name || 'Untitled product',
    slug: p.slug || '',
    categoryName: p.category?.name || 'Uncategorized',
    categorySlug: p.category?.slug || '',
    currentStock: stock,
    reservedStock: reserved,
    availableStock: Math.max(stock - reserved, 0),
    costPrice: cost,
    retailPrice: Number.isFinite(p.basePrice) ? p.basePrice : 0,
    salePrice: Number.isFinite(p.salePrice) ? p.salePrice : null,
    status: stockStatus,
    productStatus: p.status || 'draft',
    trackInventory: p.trackInventory !== false,
    imageUrl: resolveImageUrl(primaryImage),
    variants: Array.isArray(p.variants) ? p.variants : [],
  };
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all | in | low | out
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  // Edit-stock modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, searchTerm, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getAllInventory();
      const raw = extractList(response);
      const items = raw.map(mapProduct);
      setInventory(items);

      const totalProducts = items.length;
      const lowStock = items.filter((i) => i.status === 'low_stock').length;
      const outOfStock = items.filter((i) => i.status === 'out_of_stock').length;
      const totalValue = items.reduce(
        (sum, i) => sum + i.currentStock * i.costPrice,
        0
      );
      setStats({ totalProducts, lowStock, outOfStock, totalValue });
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to load inventory data',
        'error'
      );
      setInventory([]);
      setStats({ totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Defensive: always work off an array.
    const source = Array.isArray(inventory) ? inventory : [];
    let filtered = [...source];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
      );
    }

    if (stockFilter !== 'all') {
      const target =
        stockFilter === 'in'
          ? 'in_stock'
          : stockFilter === 'low'
          ? 'low_stock'
          : 'out_of_stock';
      filtered = filtered.filter((item) => item.status === target);
    }

    setFilteredInventory(filtered);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditStock(String(product.currentStock ?? 0));
    setEditReason('');
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditStock('');
    setEditReason('');
  };

  const handleSaveStock = async () => {
    const parsed = parseInt(editStock, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      Swal.fire('Error', 'Please enter a valid stock quantity', 'error');
      return;
    }
    if (!editReason) {
      Swal.fire('Error', 'Please select a reason for stock adjustment', 'error');
      return;
    }

    try {
      setSaving(true);
      // Backend expects PATCH /shop/inventory/:productId with { stock, reason, notes }
      await updateInventoryStock(editingProduct._id, {
        stock: parsed,
        reason: editReason,
      });
      Swal.fire({
        icon: 'success',
        title: 'Stock Updated',
        text: `${editingProduct.productName} stock updated to ${parsed}`,
        timer: 1800,
        showConfirmButton: false,
      });
      closeEditModal();
      fetchInventory();
    } catch (error) {
      console.error('Update stock error:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to update stock',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportReport = async (format = 'csv') => {
    try {
      const blob = await exportInventoryReport(format);
      // The service returns response.data for the raw axios call; it may
      // already be a Blob (responseType: blob) — normalize both cases.
      const finalBlob =
        blob instanceof Blob ? blob : new Blob([String(blob)], { type: 'text/csv' });
      const url = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      Swal.fire({
        icon: 'success',
        title: 'Report Downloaded',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to export report',
        'error'
      );
    }
  };

  const stockBadge = (status) => {
    switch (status) {
      case 'in_stock':
        return {
          className: 'text-green-700 bg-green-50 border border-green-200',
          icon: <TrendingUp className="w-3.5 h-3.5" />,
          label: 'In Stock',
        };
      case 'low_stock':
        return {
          className: 'text-orange-700 bg-orange-50 border border-orange-200',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Low Stock',
        };
      case 'out_of_stock':
        return {
          className: 'text-red-700 bg-red-50 border border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: 'Out of Stock',
        };
      default:
        return {
          className: 'text-gray-600 bg-gray-50 border border-gray-200',
          icon: <Package className="w-3.5 h-3.5" />,
          label: 'Unknown',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage product stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          Icon={Package}
          tone="blue"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          Icon={AlertTriangle}
          tone="orange"
          valueClass="text-orange-600"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          Icon={AlertCircle}
          tone="red"
          valueClass="text-red-600"
        />
        <StatCard
          label="Total Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          Icon={TrendingUp}
          tone="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full md:w-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, slug, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchInventory}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {inventory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No inventory yet</h3>
          <p className="text-sm text-gray-600 mt-1">
            Products you add appear here for stock tracking.
          </p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No products match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <Th align="left">Product</Th>
                  <Th align="left">Category</Th>
                  <Th align="center">Current</Th>
                  <Th align="center">Available</Th>
                  <Th align="center">Reserved</Th>
                  <Th align="center">Status</Th>
                  <Th align="center">Value (₹)</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const badge = stockBadge(item.status);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <InventoryThumbnail item={item} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            {item.slug && (
                              <div className="text-xs text-gray-500">/{item.slug}</div>
                            )}
                            {item.variants.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.variants.length} variant
                                {item.variants.length === 1 ? '' : 's'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {item.categoryName}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        {item.currentStock}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.availableStock}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {item.reservedStock}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {(item.currentStock * item.costPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Adjust Stock"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit-stock modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Stock</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-semibold text-gray-900">{editingProduct.productName}</p>
              {editingProduct.categoryName && (
                <p className="text-xs text-gray-500">
                  Category: {editingProduct.categoryName}
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Current Stock: <strong>{editingProduct.currentStock}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Quantity *
              </label>
              <input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new stock quantity"
                min="0"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Adjustment *
              </label>
              <select
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select reason...</option>
                <option value="restock">Restock / New Inventory</option>
                <option value="damaged">Damaged Items</option>
                <option value="returned">Customer Return</option>
                <option value="lost">Lost / Stolen</option>
                <option value="correction">Inventory Correction</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Updating…' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable stat card
const StatCard = ({ label, value, Icon, tone, valueClass }) => {
  const bg = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  }[tone] || 'bg-gray-100 text-gray-600';
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${valueClass || 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Th = ({ children, align = 'left' }) => (
  <th
    className={`px-6 py-3 text-${align} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
  >
    {children}
  </th>
);

// Thumbnail with graceful fallback (broken URL → gray box, no crash).
const InventoryThumbnail = ({ item }) => {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) {
    return (
      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
        No img
      </div>
    );
  }
  return (
    <img
      src={item.imageUrl}
      alt={item.productName}
      className="w-10 h-10 rounded object-cover"
      onError={() => setFailed(true)}
    />
  );
};

export default Inventory;
