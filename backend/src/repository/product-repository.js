import Product from "../models/Product.js";
import CrudRepository from "./crud-repository.js";

class ProductRepository extends CrudRepository {
  constructor() {
    super(Product);
  }

  async getAll(filters = {}) {
    try {
      const query = {};

      // Apply filters
      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.status) {
        query.status = filters.status;
      } else {
        // Default: only show active products for frontend
        if (!filters.includeAll) {
          query.status = 'active';
        }
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured === 'true' || filters.featured === true;
      }

      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { slug: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      return await this.model
        .find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      return await this.model
        .findById(id)
        .populate('category', 'name slug image description');
    } catch (error) {
      throw error;
    }
  }

  async getBySlug(slug) {
    try {
      return await this.model
        .findOne({ slug, status: 'active' })
        .populate('category', 'name slug image description');
    } catch (error) {
      throw error;
    }
  }

  async getByCategory(categorySlug) {
    try {
      return await this.model
        .find({ categorySlug, status: 'active' })
        .populate('category', 'name slug')
        .sort({ featured: -1, createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getFeatured(limit = 10) {
    try {
      return await this.model
        .find({ featured: true, status: 'active' })
        .populate('category', 'name slug')
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async incrementViews(id) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(updates) {
    try {
      const results = [];
      
      for (const update of updates) {
        const { id, ...data } = update;
        const result = await this.model.findByIdAndUpdate(id, data, { new: true });
        results.push(result);
      }

      return results;
    } catch (error) {
      throw error;
    }
  }
}

export default ProductRepository;
