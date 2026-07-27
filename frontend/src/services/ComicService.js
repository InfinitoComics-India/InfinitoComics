import axios from 'axios'
import { BASE_URL } from '../utils/constants.js'

export const fetchComics = async () => {
    const res = await axios.get(`${BASE_URL}/comic`);
    // console.log("RES in services: ", res);
    return res.data.data;
}

export const fetchChapter = async (comicId) => {
    console.log(comicId)
  try {
    const res = await axios.get(`${BASE_URL}/comicChap/${comicId}/chapters`);
    console.log(res);
    return res.data.data; 
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};