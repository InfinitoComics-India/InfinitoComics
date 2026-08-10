import axios from 'axios';
import { BASE_URL } from '../utils/constants';

export const getAllStories = async () => {
  const response = await axios.get(BASE_URL + '/timeline/getAll');
  // The API may return no payload (or an unexpected shape) if the backend is
  // unreachable or misconfigured, so fall back to an empty list instead of
  // calling .filter on undefined.
  const allStories = response?.data?.data;
  if (!Array.isArray(allStories)) return [];
  return allStories.filter((story) => story?.category === "Support Us");
};


export const createSupport = async (supportData, token) => {
  const response = await axios.post(
    `${BASE_URL}/support/create`,
    supportData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;

};

export const getStats = async () => {
    const res = await axios.get(`${BASE_URL}/support/statistics`);
    // Always resolve to an object so callers can safely read properties off it.
    return res?.data?.data ?? {};
};