import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { SERVER_BASE_URL } from "../constants/Api";

// Create Axios instance
const AxiosInstance = axios.create({
  baseURL: SERVER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional, if you use cookies/sessions
});

// Add a request interceptor to inject the token
AxiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add a response interceptor for global error handling
AxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Redirecting to login or refreshing token...");
      // You can handle logout or token refresh here
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
