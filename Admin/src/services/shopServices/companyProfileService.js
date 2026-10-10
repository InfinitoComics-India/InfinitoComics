import axios from 'axios';
import { BACKEND_URL } from '../../Utils/constant';

const authHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Fetch Company Profile details
 */
export const fetchCompanyProfile = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/shop/company-profile`, authHeader());
    return res?.data?.data || null;
  } catch (err) {
    console.error('Failed to fetch company profile:', err);
    throw err;
  }
};

/**
 * Update Company Profile details
 */
export const saveCompanyProfile = async (profileData) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/shop/company-profile`, profileData, authHeader());
    return res?.data?.data || null;
  } catch (err) {
    console.error('Failed to update company profile:', err);
    throw err;
  }
};
