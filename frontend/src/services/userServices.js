import axios from 'axios';
import { BASE_URL } from '../utils/constants';


export const loginUser = async (email, password) => {
  const response = await axios.post( BASE_URL+'/api/login', {
    email: email.toLowerCase(),
    password,
  });
  return response.data;
};

export const latestBlog = async () => {
  const response = await axios.get( BASE_URL+'/blog/latestblog', {
    limit : 1
  });
  return response?.data?.blogs[0];
}

export const getFoundationBlogs = async () => {
  const res = await axios.get(BASE_URL+'/blog/foundation-blogs'); 
  return res.data;
};

export const getICBlogs = async () => {
  const res = await axios.get(BASE_URL + '/blog/ic-blogs');
  return res.data;
};

export const getBlogsById = async (id) => {
  const res = await axios.get(`${BASE_URL}/blog/getById/${id}`);
  return res.data;
};

export const getAllBlogs = async () => {
  const res = await axios.get(`${BASE_URL}/blog/getallblog`);
  return res.data.data; 
};

export const forgetPasswordFunc = async (email) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/forget-password`, {email});
    return res.data.data;  
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Forgot password request failed');
  }
};

export const resetPasswordFunc = async (id, token, newPassword) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/forget-password/${id}/${token}`,
      { newPassword }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Reset password failed');
  }
};

export const signUpUser = async (formData) => {
  try {
    const response = await axios.post(BASE_URL + '/api/signup', {
      email: formData.email.toLowerCase(),
      password: formData.password,
      name: formData.name,
      dob: formData.dob,
      username: formData.username.trim().replace(/\s/g, ""),
      newsLetter: formData.newsLetter
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Signup failed" };
  }
};

export const verifyEmail = async (code) => {
  const response = await axios.post(BASE_URL + "/api/verifyemail", {
    code 
  });
  return response;
};

