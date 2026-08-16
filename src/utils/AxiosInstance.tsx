import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, removeAccessToken } from "./auth";
import { useAuthStore } from "../store/AuthStore";

// No shared baseURL — every one of the 8 backend services has its own API Gateway host, so every
// call site passes a full absolute URL from constants/Api.tsx. Axios uses an absolute URL as-is,
// ignoring baseURL, so this works uniformly across all services through this one instance.
const AxiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the token
AxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on a 401 (expired/invalid token, or a request that never had one), clear
// local auth state so ProtectedRoute/RedirectIfAuth pick up the logged-out state on next render
// instead of the app silently continuing to look "logged in" with a dead token.
AxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      removeAccessToken();
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
