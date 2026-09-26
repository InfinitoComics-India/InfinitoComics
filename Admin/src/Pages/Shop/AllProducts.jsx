import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid3x3, List, Edit, Trash2, MoreVertical, Eye } from 'lucide-react';
import { message, Popconfirm, Spin, Tag, Dropdown } from 'antd';
import { getAllProducts, deleteProduct } from '../../services/shopServices/productService';

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priceRange: 'all'
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      // Backend returns { success, data: [...] }, axios wraps in .data
      const productList = response.data?.data || response.data || [];
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        'under500': [0, 500],
        '500to1000': [500, 1000],
        '1000to2000': [1000, 2000],
        'above2000': [2000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange] || [0, Infinity];
      filtered = filtered.filter(p => p.price >= min && p.price < max);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'draft': return 'orange';
      case 'archived': return 'red';
      default: return 'default';
    }
  };

  const actionMenu = (product) => ({
    items: [
      {
        key: 'edit',
        icon: <Edit size={14} />,
        label: <Link to={`/shop/products/${product._id}`}>Edit</Link>,
      },
      {
        key: 'view',
        icon: <Eye size={14} />,
        label: <a href={`${import.meta.env.VITE_SHOP_BASE_URL || 'https://shop.infinitohq.com'}/product/${product._id}`} target="_blank" rel="noopener noreferrer">View on Shop</a>,
      },
      {
        key: 'delete',
        icon: <Trash2 size={14} />,
        label: 'Delete',
        danger: true,
        onClick: () => {
          // We'll wrap this in Popconfirm below
        }
      },
    ],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} products found</p>
        </div>
        <Link
          to="/shop/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DD1215] text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215] focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-gray-500" />

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
          >
            <option value="all">All Categories</option>
            <option value="tshirts">T-Shirts</option>
            <option value="hoodies">Hoodies</option>
            <option value="caps">Caps/Hats</option>
            <option value="accessory">Accessories</option>
            <option value="totebags">Tote Bags</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Price Range Filter */}
          <select
            value={filters.priceRange}
            onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
          >
            <option value="all">All Prices</option>
            <option value="under500">Under ₹500</option>
            <option value="500to1000">₹500 - ₹1000</option>
            <option value="1000to2000">₹1000 - ₹2000</option>
            <option value="above2000">Above ₹2000</option>
          </select>

          {/* View Toggle */}
          <div className="ml-auto flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-[#DD1215] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#DD1215] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Grid View"
            >
              <Grid3x3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Products List/Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No products found</p>
          <Link
            to="/shop/products/new"
            className="inline-block mt-4 text-[#DD1215] hover:underline font-medium"
          >
            Add your first product
          </Link>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.title}</p>
                        {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`${product.stock < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Tag color={getStatusColor(product.status)} className="capitalize">
                      {product.status}
                    </Tag>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/shop/products/${product._id}`}
                        className="p-2 text-gray-600 hover:text-[#DD1215] hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(product._id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                      >
                        <button
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Popconfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Tag color={getStatusColor(product.status)} className="capitalize">
                    {product.status}
                  </Tag>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                <p className="text-xs text-gray-500 mt-1 capitalize">{product.category || 'Uncategorized'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                  <span className={`text-sm ${product.stock < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    Stock: {product.stock || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/shop/products/${product._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                  <Popconfirm
                    title="Delete Product"
                    description="Are you sure?"
                    onConfirm={() => handleDelete(product._id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <button className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:text-red-600 hover:border-red-600 transition">
                      <Trash2 size={14} />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
