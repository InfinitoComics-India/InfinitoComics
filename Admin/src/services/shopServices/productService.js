import axios from "axios";
import { BACKEND_URL } from '../../Utils/constant';

const getConfig = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Get all products
export const getAllProducts = async () => {
  try {
    return await axios.get(`${BACKEND_URL}/shop/products/admin/all`, getConfig());
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Product admin endpoint returned 401/403, falling back to public catalog endpoint");
      return await axios.get(`${BACKEND_URL}/shop/products/public/all`);
    }
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    return await axios.get(`${BACKEND_URL}/shop/products/${id}`, getConfig());
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return await axios.get(`${BACKEND_URL}/shop/products/public/slug/${id}`);
    }
    throw error;
  }
};

// Create new product
export const createProduct = async (productData) => {
  return await axios.post(`${BACKEND_URL}/shop/products`, productData, getConfig());
};

// Update product
export const updateProduct = async (id, productData) => {
  return await axios.put(`${BACKEND_URL}/shop/products/${id}`, productData, getConfig());
};

// Delete product
export const deleteProduct = async (id) => {
  return await axios.delete(`${BACKEND_URL}/shop/products/${id}`, getConfig());
};

// Bulk update products
export const bulkUpdateProducts = async (updates) => {
  return await axios.patch(`${BACKEND_URL}/shop/products/bulk-update`, { updates }, getConfig());
};

// Upload product images
export const uploadProductImages = async (files) => {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();
  
  // Handle single file or array of files
  if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('images', file);
    });
  } else {
    formData.append('images', files);
  }
  
  return await axios.post(`${BACKEND_URL}/shop/products/upload-images`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
