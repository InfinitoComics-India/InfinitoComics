import axios from "axios";
import {BACKEND_URL} from '../Utils/constant'

export const addAboutItems = async (block) => {
  const {title, description, month, year, category, eventNumber } = block;

  if (!title || !description || !month || !category || !eventNumber || !year) {
    throw new Error("Please fill all fields in the block before submitting.");
  }
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("description", description);
  formData.append("month", month);
  formData.append("year", year);
  formData.append("eventNumber", String(eventNumber));

  const token = localStorage.getItem("authToken");

  const response = await axios.post(`${BACKEND_URL}/timeline/aboutUs/createAbout`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response;
};

export const getAllAboutItems = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/timeline/aboutUs/getAllAbout`);
    return response.data.data; 
  } catch (error) {
    console.error("Failed to fetch timeline items", error);
    return [];
  }
};

export const updateAboutItems = async (id, item) => {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();
  
  formData.append('title', item.title);
  formData.append('category', item.category);
  formData.append('description', item.description);
  formData.append('month', item.month);
  formData.append('year', item.year);
  formData.append('eventNumber', String(item.eventNumber));

  try {
    const response = await axios.put(
      `${BACKEND_URL}/timeline/aboutUs/updateAbout/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

export const deleteAboutItems = async (id) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.delete(`${BACKEND_URL}/timeline/aboutUs/deleteAbout/${id}`, {
      withCredentials: true, 
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};