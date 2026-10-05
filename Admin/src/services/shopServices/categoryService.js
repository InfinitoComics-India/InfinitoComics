import axios from 'axios';
import { BACKEND_URL } from '../../Utils/constant';

const BASE_URL = BACKEND_URL || 'https://infinitocomics-68cr.onrender.com';

// Get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Get all categories
export const getAllCategories = async (filters = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}/shop/categories/admin/all`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      params: filters
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Category admin endpoint returned 401/403, falling back to public endpoint');
      const fallback = await axios.get(`${BASE_URL}/shop/categories/public/all`, { params: filters });
      return fallback.data;
    }
    console.error('Get categories error:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/shop/categories/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get category error:', error);
    throw error;
  }
};

// Create new category
export const createCategory = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/shop/categories`, data, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/shop/categories/${id}`, data, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/shop/categories/${id}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

// Upload category image
export const uploadCategoryImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${BASE_URL}/shop/categories/upload-image`, formData, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Upload category image error:', error);
    throw error;
  }
};

// Reorder categories
export const reorderCategories = async (orderData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/shop/categories/reorder`, orderData, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Reorder categories error:', error);
    throw error;
  }
};
