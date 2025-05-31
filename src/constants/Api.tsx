export const API_URL = import.meta.env.VITE_BACKEND_SERVER_URL;
export const VERSION = "v1";
export const SERVER_BASE_URL = `http://localhost:8080/api/${VERSION}`;
export const BLOGS = `${SERVER_BASE_URL}/blogs`;
export const AUTH = `${SERVER_BASE_URL}/auth`;
export const LOGIN = "http://localhost:8080/api/v1/auth/login";
export const USERS = `${SERVER_BASE_URL}/users`;
