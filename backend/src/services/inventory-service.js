import InventoryRepository from "../repository/inventory-repository.js";
import ProductRepository from "../repository/product-repository.js";

class InventoryService {
  constructor() {
    this.inventoryRepository = new InventoryRepository();
    this.productRepository = new ProductRepository();
  }

  async getAll(filters = {}) {
    try {
      return await this.inventoryRepository.getAll(filters);
    } catch (error) {
      console.log("Error in getAll - InventoryService");
      throw error;
    }
  }

  async getByProductId(productId) {
    try {
      return await this.productRepository.getById(productId);
    } catch (error) {
      console.log("Error in getByProductId - InventoryService");
      throw error;
    }
  }

  async updateStock(productId, newStock, reason, notes, adminId) {
    try {
      const product = await this.productRepository.getById(productId);
      
      if (!product) {
        throw new Error("Product not found");
      }

      const previousStock = product.stock;
      const change = newStock - previousStock;

      // Update product stock
      await this.productRepository.update(productId, { stock: newStock });

      // Create history record
      await this.inventoryRepository.createHistory({
        product: productId,
        change,
        previousStock,
        newStock,
        reason,
        notes: notes || '',
        performedBy: adminId
      });

      return await this.productRepository.getById(productId);
    } catch (error) {
      console.log("Error in updateStock - InventoryService");
      throw error;
    }
  }

  async bulkUpdate(updates, adminId) {
    try {
      const results = [];

      for (const update of updates) {
        const { productId, stock, reason, notes } = update;
        const result = await this.updateStock(productId, stock, reason, notes, adminId);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.log("Error in bulkUpdate - InventoryService");
      throw error;
    }
  }

  async getHistory(productId) {
    try {
      return await this.inventoryRepository.getHistory(productId);
    } catch (error) {
      console.log("Error in getHistory - InventoryService");
      throw error;
    }
  }

  async getLowStock() {
    try {
      return await this.inventoryRepository.getLowStock();
    } catch (error) {
      console.log("Error in getLowStock - InventoryService");
      throw error;
    }
  }

  async getOutOfStock() {
    try {
      return await this.inventoryRepository.getOutOfStock();
    } catch (error) {
      console.log("Error in getOutOfStock - InventoryService");
      throw error;
    }
  }

  async exportReport(format) {
    try {
      const inventory = await this.inventoryRepository.getAll({});
      
      if (format === 'csv') {
        // Convert to CSV
        const headers = ['Product Name', 'SKU', 'Category', 'Stock', 'Reserved', 'Available', 'Status', 'Value'];
        const rows = inventory.map(item => [
          item.name,
          item.sku || '',
          item.categorySlug,
          item.stock,
          item.reservedStock,
          item.stock - item.reservedStock,
          item.stockStatus,
          item.stock * item.costPrice
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return csv;
      }

      return inventory;
    } catch (error) {
      console.log("Error in exportReport - InventoryService");
      throw error;
    }
  }
}

export default InventoryService;
