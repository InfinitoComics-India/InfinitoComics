import CategoryRepository from "../repository/category-repository.js";

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async create(data) {
    try {
      return await this.categoryRepository.create(data);
    } catch (error) {
      console.log("Error in create - CategoryService");
      throw error;
    }
  }

  async getAll(filters = {}) {
    try {
      return await this.categoryRepository.getAll(filters);
    } catch (error) {
      console.log("Error in getAll - CategoryService");
      throw error;
    }
  }

  async getById(id) {
    try {
      return await this.categoryRepository.getById(id);
    } catch (error) {
      console.log("Error in getById - CategoryService");
      throw error;
    }
  }

  async getBySlug(slug) {
    try {
      return await this.categoryRepository.getBySlug(slug);
    } catch (error) {
      console.log("Error in getBySlug - CategoryService");
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.categoryRepository.update(id, data);
    } catch (error) {
      console.log("Error in update - CategoryService");
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.categoryRepository.delete(id);
    } catch (error) {
      console.log("Error in delete - CategoryService");
      throw error;
    }
  }

  async reorder(orderData) {
    try {
      return await this.categoryRepository.reorder(orderData);
    } catch (error) {
      console.log("Error in reorder - CategoryService");
      throw error;
    }
  }
}

export default CategoryService;
