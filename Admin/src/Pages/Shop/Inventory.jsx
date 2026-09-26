import { useState, useEffect } from 'react';
import { 
  Search, Filter, AlertTriangle, AlertCircle, TrendingUp, TrendingDown,
  Package, Download, Edit2, History, RefreshCw
} from 'lucide-react';
import { 
  getAllInventory, 
  updateInventoryStock,
  getLowStockProducts,
  getOutOfStockProducts,
  exportInventoryReport
} from '../../services/shopServices/inventoryService';
import Swal from 'sweetalert2';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out, in
  
  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  // Edit modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editReason, setEditReason] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, searchTerm, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getAllInventory();
      
      // Mock data for testing
      const mockInventory = [
        {
          _id: '1',
          productId: 'p1',
          productName: 'Infinito Logo T-Shirt',
          sku: 'INF-TSH-001',
          category: 'tshirts',
          currentStock: 45,
          lowStockThreshold: 10,
          reservedStock: 5,
          availableStock: 40,
          costPrice: 299,
          retailPrice: 599,
          status: 'in_stock',
          lastRestocked: '2024-02-01',
          variants: [
            { name: 'S', stock: 10 },
            { name: 'M', stock: 15 },
            { name: 'L', stock: 12 },
            { name: 'XL', stock: 8 }
          ]
        },
        {
          _id: '2',
          productId: 'p2',
          productName: 'Quantum Hoodie',
          sku: 'INF-HOD-002',
          category: 'hoodies',
          currentStock: 8,
          lowStockThreshold: 10,
          reservedStock: 2,
          availableStock: 6,
          costPrice: 599,
          retailPrice: 1299,
          status: 'low_stock',
          lastRestocked: '2024-01-28',
          variants: [
            { name: 'M', stock: 3 },
            { name: 'L', stock: 3 },
            { name: 'XL', stock: 2 }
          ]
        },
        {
          _id: '3',
          productId: 'p3',
          productName: 'Comic Cap Black',
          sku: 'INF-CAP-003',
          category: 'caps',
          currentStock: 0,
          lowStockThreshold: 5,
          reservedStock: 0,
          availableStock: 0,
          costPrice: 199,
          retailPrice: 399,
          status: 'out_of_stock',
          lastRestocked: '2024-01-15',
          variants: []
        },
        {
          _id: '4',
          productId: 'p4',
          productName: 'Infinito Tote Bag',
          sku: 'INF-TOT-004',
          category: 'totebags',
          currentStock: 25,
          lowStockThreshold: 8,
          reservedStock: 3,
          availableStock: 22,
          costPrice: 149,
          retailPrice: 349,
          status: 'in_stock',
          lastRestocked: '2024-02-05',
          variants: []
        },
        {
          _id: '5',
          productId: 'p5',
          productName: 'Character Sticker Pack',
          sku: 'INF-ACC-005',
          category: 'accessory',
          currentStock: 6,
          lowStockThreshold: 15,
          reservedStock: 1,
          availableStock: 5,
          costPrice: 49,
          retailPrice: 99,
          status: 'low_stock',
          lastRestocked: '2024-01-20',
          variants: []
        }
      ];

      const data = response.data || mockInventory;
      setInventory(data);

      // Calculate stats
      const totalProducts = data.length;
      const lowStock = data.filter(item => item.status === 'low_stock').length;
      const outOfStock = data.filter(item => item.status === 'out_of_stock').length;
      const totalValue = data.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);

      setStats({ totalProducts, lowStock, outOfStock, totalValue });
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      Swal.fire('Error', 'Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stock filter
    if (stockFilter !== 'all') {
      if (stockFilter === 'low') {
        filtered = filtered.filter(item => item.status === 'low_stock');
      } else if (stockFilter === 'out') {
        filtered = filtered.filter(item => item.status === 'out_of_stock');
      } else if (stockFilter === 'in') {
        filtered = filtered.filter(item => item.status === 'in_stock');
      }
    }

    setFilteredInventory(filtered);
  };

  const handleEditStock = (product) => {
    setEditingProduct(product);
    setEditStock(product.currentStock.toString());
    setEditReason('');
  };

  const handleSaveStock = async () => {
    if (!editStock || isNaN(editStock) || parseInt(editStock) < 0) {
      Swal.fire('Error', 'Please enter a valid stock quantity', 'error');
      return;
    }

    if (!editReason.trim()) {
      Swal.fire('Error', 'Please provide a reason for stock adjustment', 'error');
      return;
    }

    try {
      const stockChange = parseInt(editStock) - editingProduct.currentStock;
      
      await updateInventoryStock(editingProduct._id, {
        stock: parseInt(editStock),
        reason: editReason,
        change: stockChange
      });

      Swal.fire({
        icon: 'success',
        title: 'Stock Updated',
        text: `${editingProduct.productName} stock updated to ${editStock}`,
        timer: 2000,
        showConfirmButton: false
      });

      setEditingProduct(null);
      setEditStock('');
      setEditReason('');
      fetchInventory();
    } catch (error) {
      console.error('Update stock error:', error);
      Swal.fire('Error', 'Failed to update stock', 'error');
    }
  };

  const handleExportReport = async (format) => {
    try {
      const blob = await exportInventoryReport(format);
      const url = window.URL.createObjectURL(blob);
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
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Export error:', error);
      Swal.fire('Error', 'Failed to export report', 'error');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-50';
      case 'low_stock': return 'text-orange-600 bg-orange-50';
      case 'out_of_stock': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'in_stock': return <TrendingUp className="w-4 h-4" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />;
      case 'out_of_stock': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Stock Filter */}
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

          {/* Actions */}
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

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Value (₹)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    {item.variants && item.variants.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Variants: {item.variants.map(v => `${v.name} (${v.stock})`).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">{item.currentStock}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{item.availableStock}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{item.reservedStock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${getStockStatusColor(item.status)}`}>
                        {getStockStatusIcon(item.status)}
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {(item.currentStock * item.costPrice).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditStock(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Adjust Stock"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                        title="View History"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adjust Stock</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Product</p>
              <p className="font-semibold text-gray-900">{editingProduct.productName}</p>
              <p className="text-xs text-gray-500">SKU: {editingProduct.sku}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Stock: <strong>{editingProduct.currentStock}</strong></p>
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
                onClick={() => {
                  setEditingProduct(null);
                  setEditStock('');
                  setEditReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
