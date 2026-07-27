import axios from 'axios';
import { BASE_URL } from '../utils/constants';

export const getAllStories = async () => {
  const response = await axios.get(BASE_URL + '/timeline/getAll');
  const allStories = response.data.data;
  return allStories.filter((story) => story.category === "Support Us");
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
    return res.data.data;
};