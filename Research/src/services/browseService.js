import axios from 'axios';
import { BACKEND_URL } from '../utils/constants';


export const researchBrowse = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/research-papers`);
    console.log(BACKEND_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching research papers:", error);
    throw error;
  }
};

