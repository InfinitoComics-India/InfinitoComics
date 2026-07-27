import axios from "axios";
import { BACKEND_URL } from "../Utils/constant";

export const getAllFaqs = async () => {
  return axios.get(`${BACKEND_URL}/faq`);
};

export const addFaq = async (faq) => {
  return axios.post(`${BACKEND_URL}/faq`, faq);
};

export const updateFaq = async (id, updatedFaq) => {
  return axios.put(`${BACKEND_URL}/faq/${id}`, updatedFaq);
};

export const deleteFaq = async (id) => {
  return axios.delete(`${BACKEND_URL}/faq/${id}`);
};
