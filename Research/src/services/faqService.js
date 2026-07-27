import axios from "axios";
import { BACKEND_URL } from "../utils/constants";

export const fetchFAQsByCategory = async (category) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/faq?category=${category}`);
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
};
