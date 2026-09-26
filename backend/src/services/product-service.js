import ProductRepository from "../repository/product-repository.js";
import CategoryRepository from "../repository/category-repository.js";

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
  }

  async create(data) {
    try {
      // Get category details to set categorySlug
      if (data.category) {
        const category = await this.categoryRepository.getById(data.category);
        if (category) {
          data.categorySlug = category.slug;
        }
      }

      // Set first image as primary if not specified
      if (data.images && data.images.length > 0) {
        const hasPrimary = data.images.some(img => img.isPrimary);
        if (!hasPrimary) {
          data.images[0].isPrimary = true;
        }
      }

      const product = await this.productRepository.create(data);
      
      // Update category product count
      if (product.category) {
        await this.categoryRepository.incrementProductCount(product.category);
      }

      return product;
    } catch (error) {
      console.log("Error in create - ProductService");
      throw error;
    }
  }

  async getAll(filters = {}) {
    try {
      return await this.productRepository.getAll(filters);
    } catch (error) {
      console.log("Error in getAll - ProductService");
      throw error;
    }
  }

  async getById(id) {
    try {
      return await this.productRepository.getById(id);
    } catch (error) {
      console.log("Error in getById - ProductService");
      throw error;
    }
  }

  async getBySlug(slug) {
    try {
      return await this.productRepository.getBySlug(slug);
    } catch (error) {
      console.log("Error in getBySlug - ProductService");
      throw error;
    }
  }

  async update(id, data) {
    try {
      // Update categorySlug if category changed
      if (data.category) {
        const category = await this.categoryRepository.getById(data.category);
        if (category) {
          data.categorySlug = category.slug;
        }
      }

      const oldProduct = await this.productRepository.getById(id);
      const updatedProduct = await this.productRepository.update(id, data);

      // Update category product counts if category changed
      if (oldProduct && updatedProduct && oldProduct.category.toString() !== updatedProduct.category.toString()) {
        await this.categoryRepository.decrementProductCount(oldProduct.category);
        await this.categoryRepository.incrementProductCount(updatedProduct.category);
      }

      return updatedProduct;
    } catch (error) {
      console.log("Error in update - ProductService");
      throw error;
    }
  }

  async delete(id) {
    try {
      const product = await this.productRepository.getById(id);
      
      if (product) {
        // Update category product count
        if (product.category) {
          await this.categoryRepository.decrementProductCount(product.category);
        }
        
        return await this.productRepository.delete(id);
      }
      
      return null;
    } catch (error) {
      console.log("Error in delete - ProductService");
      throw error;
    }
  }

  async bulkUpdate(updates) {
    try {
      return await this.productRepository.bulkUpdate(updates);
    } catch (error) {
      console.log("Error in bulkUpdate - ProductService");
      throw error;
    }
  }

  async getByCategory(categorySlug) {
    try {
      return await this.productRepository.getByCategory(categorySlug);
    } catch (error) {
      console.log("Error in getByCategory - ProductService");
      throw error;
    }
  }

  async getFeatured(limit = 10) {
    try {
      return await this.productRepository.getFeatured(limit);
    } catch (error) {
      console.log("Error in getFeatured - ProductService");
      throw error;
    }
  }

  async incrementViews(id) {
    try {
      return await this.productRepository.incrementViews(id);
    } catch (error) {
      console.log("Error in incrementViews - ProductService");
      throw error;
    }
  }
}

export default ProductService;
