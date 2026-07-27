import axios from "axios";
import { BACKEND_URL } from "../Utils/constant.js";


const BASE_URL = `${BACKEND_URL}/comic`;

export const fetchComics = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const createComic = async (formData, token) => {
    const response = await axios.post(BASE_URL, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
  return response.data;
};

export const updateComic = async (id, comicData, token) => {
  const response = await axios.put(`${BASE_URL}/${id}`, comicData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteComic = async (comicId, token) => {
  const response = await axios.delete(`${BASE_URL}/${comicId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const getComicById = async (comicId) => {
  const response = await axios.get(`${BASE_URL}/${comicId}`);
  return response.data;
};
