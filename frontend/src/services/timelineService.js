import axios from 'axios';
import { BASE_URL } from '../utils/constants.js';

export const getAllTimeline = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/timeline/getAll`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch timeline items", error);
    return [];
  }
};
