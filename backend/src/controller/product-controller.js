import ProductService from "../services/product-service.js";
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

// Get all products with filters
const getAllProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      featured: req.query.featured,
      search: req.query.search
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

export {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getProductsByCategory,
  getFeaturedProducts
};
