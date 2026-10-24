import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Grid3x3, List, Edit, Trash2, Eye,
  Download, FileSpreadsheet, FileText, FileCode, ChevronDown,
  Send, Sliders, Star, Upload, Image as ImageIcon, X
} from 'lucide-react';
import { message, Popconfirm, Spin, Tag, Dropdown, Modal } from 'antd';
import * as XLSX from 'xlsx';
import { getAllProducts, deleteProduct, updateProduct, pushQikinkProductToStore, uploadProductImages } from '../../services/shopServices/productService';
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
  const base = (BACKEND_URL || 'https://infinitocomics-68cr.onrender.com').replace(/\/$/, '');
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

  // Qikink Push to Store Modal state
  const [qikinkPushModalOpen, setQikinkPushModalOpen] = useState(false);
  const [pushingToStore, setPushingToStore] = useState(false);
  const [qikinkForm, setQikinkForm] = useState({
    name: 'INFINITO Cyber Hero Graphic T-Shirt',
    sku: `INF-TEE-CYBER-${Date.now().toString().slice(-4)}`,
    basePrice: 999,
    salePrice: 849,
    category: '',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    description: 'Custom print-on-demand high density apparel pushed from Qikink fulfillment.',
  });

  // Quick Edit Category & Images Modal state
  const [quickEditModalOpen, setQuickEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

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

  // ── Qikink Push to Store Handler ──
  const handlePushQikinkToStore = async () => {
    try {
      setPushingToStore(true);
      const res = await pushQikinkProductToStore(qikinkForm);
      const newProd = res.data?.data || res.data;
      if (newProd) {
        setProducts(prev => {
          const exists = prev.some(p => p._id === newProd._id || p.sku === newProd.sku);
          if (exists) {
            return prev.map(p => (p._id === newProd._id || p.sku === newProd.sku) ? newProd : p);
          }
          return [newProd, ...prev];
        });
      }
      message.success('Product successfully pushed from Qikink and reflected in All Products!');
      setQikinkPushModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || 'Failed to push product from Qikink');
    } finally {
      setPushingToStore(false);
    }
  };

  // ── Quick Edit: Category & Display Images Handlers ──
  const handleOpenQuickEdit = (product) => {
    setEditingProduct(product);
    setSelectedCategory(product.category?._id || product.category || (categories[0]?._id || ''));
    if (Array.isArray(product.images) && product.images.length > 0) {
      setProductImages(product.images.map((img, idx) => ({
        url: typeof img === 'string' ? img : (img.url || ''),
        alt: img.alt || productName(product),
        isPrimary: img.isPrimary === true || idx === 0,
      })));
    } else {
      setProductImages([]);
    }
    setQuickEditModalOpen(true);
  };

  const handleSetPrimaryProductImage = (index) => {
    setProductImages(prev => prev.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    })));
  };

  const handleRemoveProductImage = (index) => {
    setProductImages(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some(img => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleAddProductImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const isFirst = productImages.length === 0;
    setProductImages(prev => [
      ...prev,
      { url: newImageUrl.trim(), alt: editingProduct?.name || 'Product Image', isPrimary: isFirst }
    ]);
    setNewImageUrl('');
  };

  const handleUploadProductImageFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingImage(true);
      const res = await uploadProductImages(Array.from(files));
      const uploaded = res.data?.data || res.data || [];
      const newImgs = (Array.isArray(uploaded) ? uploaded : [uploaded]).map((u, i) => ({
        url: u.url || u,
        alt: u.alt || 'Uploaded Product Image',
        isPrimary: productImages.length === 0 && i === 0,
      }));
      setProductImages(prev => [...prev, ...newImgs]);
      message.success('Image(s) uploaded successfully');
    } catch (err) {
      Array.from(files).forEach((f) => {
        const reader = new FileReader();
        reader.onload = () => {
          setProductImages(prev => [
            ...prev,
            { url: reader.result, alt: f.name, isPrimary: prev.length === 0 }
          ]);
        };
        reader.readAsDataURL(f);
      });
      message.success('Image added');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveQuickEdit = async () => {
    if (!editingProduct) return;
    try {
      setSavingProduct(true);
      const res = await updateProduct(editingProduct._id, {
        category: selectedCategory,
        images: productImages,
      });
      const updated = res.data?.data || res.data || { ...editingProduct, category: selectedCategory, images: productImages };
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, ...updated } : p));
      message.success('Product category and website display images updated successfully!');
      setQuickEditModalOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setSavingProduct(false);
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

  const getExportData = () => {
    const list = filteredProducts.length > 0 ? filteredProducts : products;
    return list.map((p, index) => ({
      'S.No': index + 1,
      'Product Name': productName(p),
      'Slug': p.slug || '',
      'Category': productCategoryName(p),
      'Base Price (₹)': p.basePrice || 0,
      'Sale Price (₹)': p.salePrice || '',
      'Stock': p.stock !== null && p.stock !== undefined ? p.stock : 'N/A',
      'Status': p.status || 'draft',
      'Featured': p.featured ? 'Yes' : 'No',
      'Views': p.views || 0,
      'Sales': p.sales || 0,
      'Primary Image': productImage(p),
      'Created At': p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '',
    }));
  };

  const exportToExcel = () => {
    const rows = getExportData();
    if (rows.length === 0) {
      message.warning('No products to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 20 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 40 },
      { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `infinito_products_${Date.now()}.xlsx`);
    message.success('Products exported as Excel (.xlsx)');
  };

  const exportToCSV = () => {
    const rows = getExportData();
    if (rows.length === 0) {
      message.warning('No products to export');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infinito_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Products exported as CSV (.csv)');
  };

  const exportToJSON = () => {
    const dataToExport = filteredProducts.length > 0 ? filteredProducts : products;
    if (dataToExport.length === 0) {
      message.warning('No products to export');
      return;
    }
    const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infinito_products_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Products exported as JSON (.json)');
  };

  const exportMenuItems = [
    {
      key: 'excel',
      label: 'Download Excel (.xlsx)',
      icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
      onClick: exportToExcel,
    },
    {
      key: 'csv',
      label: 'Download CSV (.csv)',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      onClick: exportToCSV,
    },
    {
      key: 'json',
      label: 'Download JSON (.json)',
      icon: <FileCode className="w-4 h-4 text-amber-600" />,
      onClick: exportToJSON,
    },
  ];

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
        <div className="flex items-center gap-3">
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm shadow-sm cursor-pointer"
            >
              <Download size={16} />
              Export
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </Dropdown>

          <button
            type="button"
            onClick={() => setQikinkPushModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm shadow-sm cursor-pointer"
            title="Simulate or manually push a product from Qikink POD catalog"
          >
            <Send size={16} />
            Push from Qikink
          </button>

          <Link
            to="/shop/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#DD1215] text-white rounded-lg hover:bg-red-700 transition font-medium text-sm shadow-sm"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
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
                      <button
                        type="button"
                        onClick={() => handleOpenQuickEdit(product)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition"
                        title="Edit Category & Website Display Images"
                      >
                        <Sliders size={16} />
                      </button>
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
                  <button
                    type="button"
                    onClick={() => handleOpenQuickEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 transition"
                    title="Edit Category & Website Display Images"
                  >
                    <Sliders size={13} />
                    Category & Imgs
                  </button>
                  <Link
                    to={`/shop/products/${product._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Edit size={13} />
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
      {/* ── Modal 1: Push Product from Qikink to Store ── */}
      <Modal
        open={qikinkPushModalOpen}
        onCancel={() => setQikinkPushModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-purple-700 font-bold text-lg">
            <Send size={20} className="text-purple-600" />
            Push Product from Qikink to Store
          </div>
        }
        footer={null}
        width={650}
        destroyOnClose
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
            <strong>Print-on-Demand Instant Sync:</strong> When you push this product from Qikink, it immediately creates/updates the catalog item in the database and renders live across the store and admin panel.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title / Name *</label>
            <input
              type="text"
              value={qikinkForm.name}
              onChange={(e) => setQikinkForm({ ...qikinkForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Infinito Cyber Hero Graphic T-Shirt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Qikink SKU / Code</label>
              <input
                type="text"
                value={qikinkForm.sku}
                onChange={(e) => setQikinkForm({ ...qikinkForm, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="INF-TEE-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Category</label>
              <select
                value={qikinkForm.category}
                onChange={(e) => setQikinkForm({ ...qikinkForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Auto-Assign / Default</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Base / MRP Price (₹) *</label>
              <input
                type="number"
                value={qikinkForm.basePrice}
                onChange={(e) => setQikinkForm({ ...qikinkForm, basePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Website Sale Price (₹) *</label>
              <input
                type="number"
                value={qikinkForm.salePrice}
                onChange={(e) => setQikinkForm({ ...qikinkForm, salePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Qikink Mockup / Image URL</label>
            <input
              type="text"
              value={qikinkForm.image}
              onChange={(e) => setQikinkForm({ ...qikinkForm, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
            />
            {qikinkForm.image && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 border rounded-lg">
                <img src={qikinkForm.image} alt="Mockup" className="w-12 h-12 object-cover rounded border" />
                <span className="text-xs text-gray-500 truncate">{qikinkForm.image}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={qikinkForm.description}
              onChange={(e) => setQikinkForm({ ...qikinkForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setQikinkPushModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pushingToStore}
              onClick={handlePushQikinkToStore}
              className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {pushingToStore ? <Spin size="small" /> : <Send size={15} />}
              Push to Store
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal 2: Quick Edit Category & Website Display Images ── */}
      <Modal
        open={quickEditModalOpen}
        onCancel={() => setQuickEditModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <Sliders size={20} className="text-purple-600" />
            Edit Category & Website Display Images
          </div>
        }
        footer={null}
        width={750}
        destroyOnClose
      >
        {editingProduct && (
          <div className="space-y-5 pt-2">
            <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">{productName(editingProduct)}</p>
                <p className="text-xs text-gray-500">ID: {editingProduct._id} | SKU: {editingProduct.sku || 'N/A'}</p>
              </div>
              <Tag color={getStatusColor(editingProduct.status)} className="capitalize">
                {editingProduct.status}
              </Tag>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category (shown on website navigation & filters) *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.slug ? `(/${c.slug})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Website Display Images */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Website Display Images
                </label>
                <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                  ⭐ Star marks the PRIMARY image shown on product cards
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Select which image appears as the main display cover on the website catalog and detail views.
              </p>

              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                {productImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group border-2 rounded-lg overflow-hidden bg-gray-50 p-1.5 transition ${
                      img.isPrimary ? 'border-amber-500 shadow-md ring-2 ring-amber-200' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div className="aspect-square w-full rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={resolveImageUrl(img.url)}
                        alt={img.alt || `Product Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      {img.isPrimary ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Star size={11} className="fill-amber-500 text-amber-500" />
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryProductImage(idx)}
                          className="text-[11px] text-gray-600 hover:text-purple-600 font-medium"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Upload Options */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL to add (https://...)"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProductImageUrl}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-black"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 cursor-pointer transition">
                    <Upload size={14} />
                    {uploadingImage ? 'Uploading...' : 'Upload Image File'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadProductImageFiles}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <span className="text-[11px] text-gray-500">Supports PNG, JPG, WEBP.</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setQuickEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingProduct}
                onClick={handleSaveQuickEdit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#DD1215] text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {savingProduct && <Spin size="small" />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
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
    const base = (BACKEND_URL || 'https://infinitocomics-68cr.onrender.com').replace(/\/$/, '');
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
