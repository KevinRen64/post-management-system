// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://posts-api-alb-1842861892.ap-southeast-2.elb.amazonaws.com",
});

// Attach token from localStorage
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
