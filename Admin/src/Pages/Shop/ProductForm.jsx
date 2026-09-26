import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Upload, Trash2, Plus, 
  Image as ImageIcon, Tag, Package, IndianRupee,
  FileText
} from 'lucide-react';
import { 
  getProductById, 
  createProduct, 
  updateProduct, 
  uploadProductImages 
} from '../../services/shopServices/productService';
import { getAllCategories } from '../../services/shopServices/categoryService';
import Swal from 'sweetalert2';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, variants, inventory, seo

  // Basic Info
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    status: 'draft',
    featured: false,
  });

  // Available categories from backend
  const [categories, setCategories] = useState([]);

  // Pricing & Inventory
  const [pricing, setPricing] = useState({
    basePrice: '',
    salePrice: '',
    costPrice: '',
    trackInventory: true,
    stock: '',
  });

  // Images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Variants (size, color, etc.)
  const [variants, setVariants] = useState([]);
  const [showVariantForm, setShowVariantForm] = useState(false);

  // Tag input
  const [keywordInput, setKeywordInput] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      // Backend returns { success, data: [...] }, axios wraps in .data
      const categoryList = response.data?.data || response.data || [];
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditMode && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditMode]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      // Backend returns { success, data: {...} }, axios wraps in .data
      const product = response.data?.data || response.data;

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        // category may be populated object or ObjectId string
        category: product.category?._id || product.category || '',
        status: product.status || 'draft',
        featured: product.featured || false,
      });

      setPricing({
        basePrice: product.basePrice || '',
        salePrice: product.salePrice || '',
        costPrice: product.costPrice || '',
        trackInventory: product.trackInventory !== false,
        stock: product.stock || '',
      });

      setImages(product.images || []);
      setVariants(product.variants || []);
    } catch (error) {
      console.error('Failed to load product:', error);
      Swal.fire('Error', 'Failed to load product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      Swal.fire('Error', 'Product name is required', 'error');
      return;
    }

    if (!pricing.basePrice || pricing.basePrice <= 0) {
      Swal.fire('Error', 'Valid base price is required', 'error');
      return;
    }

    try {
      setLoading(true);

      // Upload new images if any
      // Keep only existing (non-new) images; new files will be uploaded fresh
      let uploadedImages = images.filter(img => !img.isNew);
      if (imageFiles.length > 0) {
        const uploadResponse = await uploadProductImages(imageFiles);
        // Backend returns { success, message, data: [...] }, axios wraps in .data
        const newImages = uploadResponse.data?.data || [];
        if (Array.isArray(newImages)) {
          uploadedImages = [...uploadedImages, ...newImages];
        }
      }

      // Validate category is selected
      if (!formData.category) {
        Swal.fire('Error', 'Please select a category', 'error');
        setLoading(false);
        return;
      }

      const productData = {
        ...formData,
        ...pricing,
        images: uploadedImages,
        variants,
      };

      let response;
      if (isEditMode) {
        response = await updateProduct(id, productData);
        Swal.fire('Success', 'Product updated successfully', 'success');
      } else {
        response = await createProduct(productData);
        Swal.fire('Success', 'Product created successfully', 'success');
      }

      navigate('/shop/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { url: reader.result, isNew: true }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Variant management
  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      options: [{ value: '', price: '', stock: '' }]
    }]);
    setShowVariantForm(true);
  };

  const updateVariant = (variantId, field, value) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  const addVariantOption = (variantId) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId 
        ? { ...v, options: [...v.options, { value: '', price: '', stock: '' }] }
        : v
    ));
  };

  const updateVariantOption = (variantId, optionIndex, field, value) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId 
        ? {
            ...v,
            options: v.options.map((opt, i) => 
              i === optionIndex ? { ...opt, [field]: value } : opt
            )
          }
        : v
    ));
  };

  const removeVariant = (variantId) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const removeVariantOption = (variantId, optionIndex) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId 
        ? { ...v, options: v.options.filter((_, i) => i !== optionIndex) }
        : v
    ));
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/shop/products')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? 'Update product details' : 'Create a new product for your shop'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop/products')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                  activeTab === 'variants'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Variants
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition ${
                  activeTab === 'inventory'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Pricing & Inventory
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="product-url-slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated from product name. You can customize it.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Detailed product description..."
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description for listings..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    {categories.length === 0 ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        No categories found. Please{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/shop/categories/new')}
                          className="underline font-medium hover:text-yellow-900"
                        >
                          create a category
                        </button>{' '}
                        first before adding products.
                      </div>
                    ) : (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === 'variants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                      <p className="text-sm text-gray-600">Add size, color, or other variations</p>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No variants added yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Add variants like Size, Color, Material, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variants.map((variant, vIndex) => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                              placeholder="Variant name (e.g., Size, Color)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {variant.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => updateVariantOption(variant.id, oIndex, 'value', e.target.value)}
                                  placeholder="Value (e.g., S, M, L)"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="number"
                                  value={option.price}
                                  onChange={(e) => updateVariantOption(variant.id, oIndex, 'price', e.target.value)}
                                  placeholder="Price"
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                  type="number"
                                  value={option.stock}
                                  onChange={(e) => updateVariantOption(variant.id, oIndex, 'stock', e.target.value)}
                                  placeholder="Stock"
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantOption(variant.id, oIndex)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addVariantOption(variant.id)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pricing & Inventory Tab */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <IndianRupee className="w-5 h-5" />
                      Pricing
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Price *
                        </label>
                        <input
                          type="number"
                          value={pricing.basePrice}
                          onChange={(e) => setPricing(prev => ({ ...prev, basePrice: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sale Price
                        </label>
                        <input
                          type="number"
                          value={pricing.salePrice}
                          onChange={(e) => setPricing(prev => ({ ...prev, salePrice: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost Price
                        </label>
                        <input
                          type="number"
                          value={pricing.costPrice}
                          onChange={(e) => setPricing(prev => ({ ...prev, costPrice: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inventory Tracking */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Inventory Management
                    </h3>
                    
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="trackInventory"
                        checked={pricing.trackInventory}
                        onChange={(e) => setPricing(prev => ({ ...prev, trackInventory: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="trackInventory" className="ml-2 text-sm text-gray-700">
                        Track inventory for this product
                      </label>
                    </div>

                    {pricing.trackInventory && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Stock
                        </label>
                        <input
                          type="number"
                          value={pricing.stock}
                          onChange={(e) => setPricing(prev => ({ ...prev, stock: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Images
            </h3>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          {/* Quick Stats (Edit Mode Only) */}
          {isEditMode && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-medium">₹0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
