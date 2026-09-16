import axios from "axios";
import { BACKEND_URL } from "../Utils/constant";

export const fetchContactQueries = async ({ topic = "", status = "", page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (topic)  params.append("topic", topic);
  if (status) params.append("status", status);
  params.append("page", page);
  params.append("limit", limit);
  return axios.get(`${BACKEND_URL}/contact-query?${params.toString()}`);
};

export const updateQueryStatus = async (id, status) => {
  return axios.patch(`${BACKEND_URL}/contact-query/${id}/status`, { status });
};

export const deleteContactQuery = async (id) => {
  return axios.delete(`${BACKEND_URL}/contact-query/${id}`);
};
