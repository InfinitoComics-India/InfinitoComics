import ProductService from "../services/product-service.js";
import Product from "../models/Product.js";
import ShopCategory from "../models/ShopCategory.js";
const productService = new ProductService();

// Create a new product
const createProduct = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const productData = {
      ...req.body,
      createdBy: adminId,
      updatedBy: adminId
    };

    const product = await productService.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all products with filters (admin sees all; public sees only active)
const getAllProducts = async (req, res) => {
  try {
    const isAdminRoute =
      req.originalUrl.includes("/admin/") || Boolean(req.user);

    const filters = {
      category: req.query.category,
      status: req.query.status,
      featured: req.query.featured,
      search: req.query.search,
      includeAll: isAdminRoute && !req.query.status,
    };

    const products = await productService.getAll(filters);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by slug (for frontend)
const getProductBySlug = async (req, res) => {
  try {
    const product = await productService.getBySlug(req.params.slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment views
    await productService.incrementViews(product._id);

    return res.status(200).json({
      success: true,
      message: "Product found",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const updateData = {
      ...req.body,
      updatedBy: adminId
    };

    const product = await productService.update(req.params.id, updateData);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await productService.delete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk update products
const bulkUpdateProducts = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    const result = await productService.bulkUpdate(updates);

    return res.status(200).json({
      success: true,
      message: "Products updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get products by category (for frontend)
const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const products = await productService.getByCategory(categorySlug);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get featured products (for frontend)
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await productService.getFeatured(limit);

    return res.status(200).json({
      success: true,
      message: "Featured products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Push product from Qikink into store catalog (webhook or manual trigger)
const pushQikinkProductToStore = async (req, res) => {
  try {
    const body = req.body || {};
    const pData = body.product || body.data || body;

    const rawName = String(pData.name || pData.title || pData.product_name || 'Qikink Custom Apparel').trim();
    const rawSku = String(pData.sku || pData.product_sku || pData.item_code || `INF-QIK-${Date.now().toString().slice(-5)}`).trim();
    const rawDesc = String(pData.description || pData.details || pData.short_description || `Premium quality print apparel fulfilled by Qikink Print-on-Demand.`);
    const rawPrice = Number(pData.price || pData.retail_price || pData.basePrice || pData.mrp || 899);
    const salePrice = pData.salePrice ? Number(pData.salePrice) : (rawPrice > 99 ? rawPrice - 100 : null);

    // Normalize images: ensure primary image is flagged for main website display
    let images = [];
    if (Array.isArray(pData.images) && pData.images.length > 0) {
      images = pData.images.map((img, idx) => {
        const url = typeof img === 'string' ? img : (img.url || img.src || img.link || '');
        return {
          url,
          alt: rawName,
          isPrimary: idx === 0 || img.isPrimary === true,
        };
      }).filter(img => Boolean(img.url));
    } else if (pData.image || pData.image_url || pData.mockup_url || pData.mockup) {
      const url = pData.image || pData.image_url || pData.mockup_url || pData.mockup;
      images = [{ url, alt: rawName, isPrimary: true }];
    } else {
      images = [{
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        alt: rawName,
        isPrimary: true,
      }];
    }

    // Resolve Category:
    let categoryDoc = null;
    if (pData.category || pData.categoryId) {
      const catId = pData.category || pData.categoryId;
      if (String(catId).match(/^[0-9a-fA-F]{24}$/)) {
        categoryDoc = await ShopCategory.findById(catId);
      }
      if (!categoryDoc && typeof catId === 'string') {
        categoryDoc = await ShopCategory.findOne({
          $or: [
            { slug: catId.toLowerCase() },
            { name: new RegExp(`^${catId}$`, 'i') }
          ]
        });
      }
    }

    if (!categoryDoc) {
      categoryDoc = await ShopCategory.findOne({ status: 'active' }).sort({ displayOrder: 1 });
      if (!categoryDoc) {
        categoryDoc = await ShopCategory.create({
          name: 'Apparel',
          slug: 'apparel',
          description: 'Custom print-on-demand apparel powered by Qikink',
          status: 'active',
        });
      }
    }

    // Build variants
    let variants = [];
    if (Array.isArray(pData.variants) && pData.variants.length > 0) {
      const sizeOptions = pData.variants.map((v) => ({
        value: v.size || v.name || v.title || 'M',
        price: Number(v.price || 0),
        stock: Number(v.stock !== undefined ? v.stock : 50),
        sku: v.sku || `${rawSku}-${v.size || 'M'}`,
      }));
      variants.push({
        name: 'Size',
        options: sizeOptions,
      });
    } else {
      variants.push({
        name: 'Size',
        options: [
          { value: 'S', price: 0, stock: 50, sku: `${rawSku}-S` },
          { value: 'M', price: 0, stock: 50, sku: `${rawSku}-M` },
          { value: 'L', price: 0, stock: 50, sku: `${rawSku}-L` },
          { value: 'XL', price: 0, stock: 50, sku: `${rawSku}-XL` },
        ],
      });
    }

    // Generate unique slug
    let baseSlug = rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = `qikink-product-${Date.now().toString().slice(-4)}`;

    let slug = baseSlug;
    const existingWithSlug = await Product.findOne({ slug });
    if (existingWithSlug && existingWithSlug.sku !== rawSku) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Upsert product
    let product = await Product.findOne({
      $or: [
        { sku: rawSku },
        { slug }
      ]
    });

    if (product) {
      product.name = rawName;
      product.description = rawDesc;
      product.category = categoryDoc._id;
      product.categorySlug = categoryDoc.slug;
      product.basePrice = rawPrice;
      if (salePrice) product.salePrice = salePrice;
      if (images.length > 0) product.images = images;
      product.variants = variants;
      product.status = 'active';
      await product.save();
    } else {
      product = await Product.create({
        name: rawName,
        slug,
        description: rawDesc,
        shortDescription: rawDesc.slice(0, 150),
        category: categoryDoc._id,
        categorySlug: categoryDoc.slug,
        basePrice: rawPrice,
        salePrice,
        sku: rawSku,
        images,
        variants,
        stock: Number(pData.stock !== undefined ? pData.stock : 100),
        status: 'active',
        featured: Boolean(pData.featured),
        trackInventory: true,
      });
      await ShopCategory.findByIdAndUpdate(categoryDoc._id, { $inc: { productCount: 1 } });
    }

    const populatedProduct = await Product.findById(product._id).populate('category');

    return res.status(200).json({
      success: true,
      message: 'Product successfully pushed from Qikink to store!',
      data: populatedProduct,
    });
  } catch (error) {
    console.error('Error pushing Qikink product to store:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to push Qikink product to store',
    });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getProductsByCategory,
  getFeaturedProducts,
  pushQikinkProductToStore
};
