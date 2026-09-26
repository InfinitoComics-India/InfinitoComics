import axios from 'axios';
import { BACKEND_URL } from '../../Utils/constant';

// Get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Get all inventory items
export const getAllInventory = async (filters = {}) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Get inventory error:', error);
    throw error;
  }
};

// Get inventory by product ID
export const getInventoryByProductId = async (productId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory/product/${productId}`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get product inventory error:', error);
    throw error;
  }
};

// Update inventory stock
export const updateInventoryStock = async (productId, data) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}/shop/inventory/${productId}`, data, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Update inventory error:', error);
    throw error;
  }
};

// Bulk update inventory
export const bulkUpdateInventory = async (updates) => {
  try {
    const response = await axios.patch(`${BACKEND_URL}/shop/inventory/bulk-update`, updates, {
      headers: { 
        Authorization: `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Bulk update inventory error:', error);
    throw error;
  }
};

// Get inventory history/logs
export const getInventoryHistory = async (productId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory/${productId}/history`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get inventory history error:', error);
    throw error;
  }
};

// Get low stock products
export const getLowStockProducts = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory/low-stock`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get low stock products error:', error);
    throw error;
  }
};

// Get out of stock products
export const getOutOfStockProducts = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory/out-of-stock`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Get out of stock products error:', error);
    throw error;
  }
};

// Export inventory report
export const exportInventoryReport = async (format = 'csv') => {
  try {
    const response = await axios.get(`${BACKEND_URL}/shop/inventory/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Export inventory error:', error);
    throw error;
  }
};
