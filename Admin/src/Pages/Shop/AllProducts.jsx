import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid3x3, List, Edit, Trash2, Eye } from 'lucide-react';
import { message, Popconfirm, Spin, Tag } from 'antd';
import { getAllProducts, deleteProduct } from '../../services/shopServices/productService';
import { getAllCategories } from '../../services/shopServices/categoryService';
import { BACKEND_URL } from '../../Utils/constant';

// Uploaded images come back as "/uploads/shop/xxx.png" and need the backend
// host prepended so the browser can load them. External URLs / data URIs pass
// through untouched.
const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = BACKEND_URL?.replace(/\/$/, '') || '';
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

// Extract an array from any of the response shapes our services return:
// raw axios response, unwrapped body { data: [...] }, or the array itself.
const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priceRange: 'all',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, filters]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(extractList(prodRes));
      setCategories(extractList(catRes));
    } catch (error) {
      console.error('Failed to fetch products/categories:', error);
      message.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Backend product shape: { _id, name, slug, category: { _id, name, slug },
  //   basePrice, salePrice, stock, status, images: [{ url, alt, isPrimary }] }
  const productName = (p) => p.name || p.title || '';
  const productImage = (p) => {
    const first = Array.isArray(p.images) ? p.images[0] : null;
    return resolveImageUrl(first?.url || first || '');
  };
  const productPrice = (p) => p.salePrice || p.basePrice || p.price || 0;
  const productCategorySlug = (p) => p.category?.slug || p.categorySlug || '';
  const productCategoryName = (p) => p.category?.name || p.category || 'Uncategorized';

  const applyFilters = () => {
    // Defensive: ensure products is always an array before spreading.
    const source = Array.isArray(products) ? products : [];
    let filtered = [...source];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        productName(p).toLowerCase().includes(q) ||
        (p.slug || '').toLowerCase().includes(q)
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((p) => productCategorySlug(p) === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.priceRange !== 'all') {
      const ranges = {
        under500: [0, 500],
        '500to1000': [500, 1000],
        '1000to2000': [1000, 2000],
        above2000: [2000, Infinity],
      };
      const [min, max] = ranges[filters.priceRange] || [0, Infinity];
      filtered = filtered.filter((p) => {
        const price = productPrice(p);
        return price >= min && price < max;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted successfully');
      fetchAll();
    } catch (error) {
      message.error('Failed to delete product');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'red';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
          </p>
        </div>
        <Link
          to="/shop/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DD1215] text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD1215] focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-gray-500" />

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD1215]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

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
          <p className="text-gray-500">
            {products.length === 0
              ? 'No products yet.'
              : 'No products match the current filters.'}
          </p>
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
                      <ProductThumbnail product={product} size={48} />
                      <div>
                        <p className="font-medium text-gray-900">{productName(product)}</p>
                        {product.slug && <p className="text-xs text-gray-500">/{product.slug}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{productCategoryName(product)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{productPrice(product)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`${(product.stock || 0) < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {product.stock ?? 0}
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
              <div className="relative aspect-square bg-gray-100">
                <ProductThumbnail product={product} fill />
                <div className="absolute top-2 right-2">
                  <Tag color={getStatusColor(product.status)} className="capitalize">
                    {product.status}
                  </Tag>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{productName(product)}</h3>
                <p className="text-xs text-gray-500 mt-1 capitalize">{productCategoryName(product)}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">₹{productPrice(product)}</span>
                  <span className={`text-sm ${(product.stock || 0) < 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    Stock: {product.stock ?? 0}
                  </span>
                </div>

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

// Small helper that renders a product image with graceful fallback. Falls
// back to a "No img" tile when there's no image or the image fails to load
// (broken URL, missing file on Render, wrong MIME, etc.).
const ProductThumbnail = ({ product, size, fill }) => {
  const [failed, setFailed] = useState(false);
  const first = Array.isArray(product.images) ? product.images[0] : null;
  const src = failed ? '' : (() => {
    const raw = first?.url || first || '';
    if (!raw) return '';
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
    const base = BACKEND_URL?.replace(/\/$/, '') || '';
    return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
  })();

  const containerClass = fill
    ? 'w-full h-full'
    : 'rounded object-cover';

  const dimensionStyle = fill ? undefined : { width: size, height: size };

  if (!src) {
    return (
      <div
        className={`${fill ? 'w-full h-full' : ''} bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs`}
        style={dimensionStyle}
      >
        No img
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product.name || product.title || 'Product'}
      className={fill ? 'w-full h-full object-cover' : containerClass}
      style={dimensionStyle}
      onError={() => setFailed(true)}
    />
  );
};

export default AllProducts;
