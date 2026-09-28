import InventoryService from "../services/inventory-service.js";
const inventoryService = new InventoryService();

// Get all inventory
const getAllInventory = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      stockStatus: req.query.stockStatus,
      search: req.query.search
    };

    const inventory = await inventoryService.getAll(filters);

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory by product ID
const getInventoryByProductId = async (req, res) => {
  try {
    const inventory = await inventoryService.getByProductId(req.params.productId);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory found",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update inventory stock
const updateInventoryStock = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { stock, reason, notes } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity is required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const result = await inventoryService.updateStock(
      req.params.productId,
      stock,
      reason,
      notes,
      adminId
    );

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Bulk update inventory
const bulkUpdateInventory = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
    }

    const result = await inventoryService.bulkUpdate(updates, adminId);

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get inventory history
const getInventoryHistory = async (req, res) => {
  try {
    const history = await inventoryService.getHistory(req.params.productId);

    return res.status(200).json({
      success: true,
      message: "History fetched successfully",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const products = await inventoryService.getLowStock();

    return res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get out of stock products
const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await inventoryService.getOutOfStock();

    return res.status(200).json({
      success: true,
      message: "Out of stock products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export inventory report
const exportInventoryReport = async (req, res) => {
  try {
    const format = req.query.format || 'csv';
    const report = await inventoryService.exportReport(format);

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${Date.now()}.${format}`);
    
    return res.status(200).send(report);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllInventory,
  getInventoryByProductId,
  updateInventoryStock,
  bulkUpdateInventory,
  getInventoryHistory,
  getLowStockProducts,
  getOutOfStockProducts,
  exportInventoryReport
};
