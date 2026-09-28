import ShopCategory from "../models/ShopCategory.js";
import CrudRepository from "./crud-repository.js";

class CategoryRepository extends CrudRepository {
  constructor() {
    super(ShopCategory);
  }

  async getAll(filters = {}) {
    try {
      const query = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      } else {
        // Default: only show active categories for frontend
        if (!filters.includeAll) {
          query.status = 'active';
        }
      }

      return await this.model
        .find(query)
        .sort({ displayOrder: 1, createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getBySlug(slug) {
    try {
      return await this.model.findOne({ slug, status: 'active' });
    } catch (error) {
      throw error;
    }
  }

  async incrementProductCount(categoryId) {
    try {
      return await this.model.findByIdAndUpdate(
        categoryId,
        { $inc: { productCount: 1 } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async decrementProductCount(categoryId) {
    try {
      return await this.model.findByIdAndUpdate(
        categoryId,
        { $inc: { productCount: -1 } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async reorder(orderData) {
    try {
      const results = [];

      for (const item of orderData) {
        const { id, displayOrder } = item;
        const result = await this.model.findByIdAndUpdate(
          id,
          { displayOrder },
          { new: true }
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

export default CategoryRepository;
