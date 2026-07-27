import axios from "axios";
import { BACKEND_URL } from "../Utils/constant.js";

export const addChapter = async (comicId, chapterData) => {
  const formData = new FormData(); 

  formData.append("title", chapterData.title);
  formData.append("chapNum", chapterData.chapterNumber);
  formData.append("releaseDate", chapterData.releaseDate);
  formData.append("chapterImage", chapterData.chapterImage); 
  formData.append("chapterPdf", chapterData.chapterPdf); 

  const token = localStorage.getItem("authToken");

  return axios.post(`${BACKEND_URL}/comicChap/${comicId}/chapters`, formData, {
     headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const getAllChapters = async (comicId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/comicChap/${comicId}/chapters`);
    return response.data.data; 
  } catch (error) {
    console.error("Failed to fetch chapters", error);
    return [];
  }
};

export const deleteChapter = async (comicId, chapterId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/comicChap/${comicId}/chapters/${chapterId}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
};

export const updateChapter = async (comicId, chapterId, chapterData) => {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();

  formData.append("title", chapterData.title);
  formData.append("chapNum", chapterData.chapterNumber);
  formData.append("releaseDate", chapterData.releaseDate);

  if (chapterData.chapterImage instanceof File) {
    formData.append("chapterImage", chapterData.chapterImage);
  } else if (chapterData.chapImage) {
    formData.append("chapterImageUrl", chapterData.chapImage); 
  }

  if (chapterData.chapterPdf instanceof File) {
    formData.append("chapterPdf", chapterData.chapterPdf);
  } else if (chapterData.chapPdf) {
    formData.append("chapterPdfUrl", chapterData.chapPdf); 
  }

  try {
    const response = await axios.put(
      `${BACKEND_URL}/comicChap/${comicId}/chapters/${chapterId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
};


