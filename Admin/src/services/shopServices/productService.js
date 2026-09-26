import axios from "axios";
import { BACKEND_URL } from '../../Utils/constant';

const token = localStorage.getItem("authToken");

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
};

// Get all products
export const getAllProducts = async () => {
  return await axios.get(`${BACKEND_URL}/shop/products`, config);
};

// Get single product by ID
export const getProductById = async (id) => {
  return await axios.get(`${BACKEND_URL}/shop/products/${id}`, config);
};

// Create new product
export const createProduct = async (productData) => {
  return await axios.post(`${BACKEND_URL}/shop/products`, productData, config);
};

// Update product
export const updateProduct = async (id, productData) => {
  return await axios.put(`${BACKEND_URL}/shop/products/${id}`, productData, config);
};

// Delete product
export const deleteProduct = async (id) => {
  return await axios.delete(`${BACKEND_URL}/shop/products/${id}`, config);
};

// Bulk update products
export const bulkUpdateProducts = async (updates) => {
  return await axios.patch(`${BACKEND_URL}/shop/products/bulk`, { updates }, config);
};

// Upload product images
export const uploadProductImages = async (formData) => {
  return await axios.post(`${BACKEND_URL}/shop/products/images`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
