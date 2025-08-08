export const API_URL = import.meta.env.VITE_BACKEND_SERVER_URL;
export const VERSION = "v1";
export const SERVER_BASE_URL = `${API_URL}/${VERSION}`;
export const BLOGS = `${SERVER_BASE_URL}/blogs`;
export const AUTH = `${SERVER_BASE_URL}/auth`;
export const REGISTER = `${AUTH}/register`;
export const LOGIN = `${SERVER_BASE_URL}/auth/login`;
export const USERS = `${SERVER_BASE_URL}/users`;
export const DSA = `${SERVER_BASE_URL}/dsa`;
export const DSA_BY_USER = `${DSA}/user`;
export const TECHNICAL_INTERVIEW = `${SERVER_BASE_URL}/techinterview`;

export const SEND_OTP = `${AUTH}/otp`;
export const VERIFY_OTP = `${AUTH}/verify-otp`;
