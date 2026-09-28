import CategoryService from "../services/category-service.js";
const categoryService = new CategoryService();

// Create a new category
const createCategory = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const categoryData = {
      ...req.body,
      createdBy: adminId,
      updatedBy: adminId
    };

    const category = await categoryService.create(categoryData);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all categories (admin sees all; public sees only active)
const getAllCategories = async (req, res) => {
  try {
    // Detect admin route by the URL path (`/admin/all`) or an authenticated req.user
    const isAdminRoute =
      req.originalUrl.includes("/admin/") || Boolean(req.user);

    const filters = {
      // If an explicit status is provided in the query, respect it
      status: req.query.status,
      // Admin routes should include categories of all statuses
      includeAll: isAdminRoute && !req.query.status,
    };

    const categories = await categoryService.getAll(filters);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category found",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get category by slug (for frontend)
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await categoryService.getBySlug(req.params.slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category found",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const updateData = {
      ...req.body,
      updatedBy: adminId
    };

    const category = await categoryService.update(req.params.id, updateData);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryService.delete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reorder categories
const reorderCategories = async (req, res) => {
  try {
    const { orderData } = req.body;

    if (!Array.isArray(orderData) || orderData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order data array is required",
      });
    }

    const result = await categoryService.reorder(orderData);

    return res.status(200).json({
      success: true,
      message: "Categories reordered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  reorderCategories
};
