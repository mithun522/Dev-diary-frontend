export const BACKEND_URL = import.meta.env.VITE_BACKEND_SERVER_URL;

export const API_URL = `${BACKEND_URL}/api`;
export const VERSION = "v1";
export const SERVER_BASE_URL = `${API_URL}/${VERSION}`;

export const BLOGS = `${SERVER_BASE_URL}/blogs`;
export const GET_BLOGS_BY_USER = `${BLOGS}/user`;
export const GET_PUBLISHED_BLOGS = `${BLOGS}/published`;
export const GET_DRAFTED_BLOGS = `${BLOGS}/draft`;

export const AUTH = `${SERVER_BASE_URL}/auth`;
export const REGISTER = `${AUTH}/register`;
export const LOGIN = `${SERVER_BASE_URL}/auth/login`;
export const USERS = `${SERVER_BASE_URL}/users`;
export const SEND_OTP = `${AUTH}/otp`;
export const VERIFY_OTP = `${AUTH}/verifyotp`;

export const DSA = `${SERVER_BASE_URL}/dsa`;
export const DSA_BY_USER = `${DSA}/user`;

export const TECHNICAL_INTERVIEW = `${SERVER_BASE_URL}/techinterview`;
