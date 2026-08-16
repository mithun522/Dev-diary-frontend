/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { logger } from "./logger";
interface DecodedToken {
  exp: number;
  [key: string]: any;
}

// src/utils/auth.ts
export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const removeAccessToken = () => {
  localStorage.removeItem("accessToken");
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (!decoded.exp) return true; // no exp claim → treat as expired

    return decoded.exp * 1000 < Date.now();
  } catch (error: any) {
    logger.error(error);
    return true;
  }
};

export const loggedInUserId = () => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    // Our backend's JWTs carry the user id as `sub` (standard JWT claim), not `id`.
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.sub;
  } catch (error: any) {
    logger.error(error);
    return null;
  }
};
