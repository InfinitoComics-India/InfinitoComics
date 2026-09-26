import Product from "../models/Product.js";
import InventoryHistory from "../models/Inventory.js";

class InventoryRepository {
  async getAll(filters = {}) {
    try {
      const query = { trackInventory: true };

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.stockStatus) {
        if (filters.stockStatus === 'low') {
          query.stock = { $gt: 0, $lte: 10 };
        } else if (filters.stockStatus === 'out') {
          query.stock = 0;
        } else if (filters.stockStatus === 'in') {
          query.stock = { $gt: 10 };
        }
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { slug: { $regex: filters.search, $options: 'i' } }
        ];
      }

      return await Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async createHistory(data) {
    try {
      return await InventoryHistory.create(data);
    } catch (error) {
      throw error;
    }
  }

  async getHistory(productId, limit = 50) {
    try {
      return await InventoryHistory.find({ product: productId })
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  async getLowStock() {
    try {
      return await Product.find({
        trackInventory: true,
        stock: { $gt: 0, $lte: 10 },
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort({ stock: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getOutOfStock() {
    try {
      return await Product.find({
        trackInventory: true,
        stock: 0,
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }
}

export default InventoryRepository;
