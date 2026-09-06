import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "../utils/logger";

interface AuthState {
  token: string | null;
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  validateToken: () => Promise<boolean>;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      role: null,
      isAdmin: false,
      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          set({
            token,
            userId: decoded.sub,
            role: decoded.role ?? null,
            isAdmin: decoded.role === "admin",
          });
        } catch (e) {
          logger.error("Invalid token:", e);
        }
      },
      clearAuth: () => set({ token: null, userId: null, role: null, isAdmin: false }),
      validateToken: async () => {
        const token = localStorage.getItem("token") || get().token;
        if (!token) return false;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const isValid = decoded.exp * 1000 > Date.now();

          if (isValid) {
            set({
              token,
              userId: decoded.sub,
              role: decoded.role ?? null,
              isAdmin: decoded.role === "admin",
            });
          } else {
            get().clearAuth();
          }

          return isValid;
        } catch (e) {
          logger.error("Invalid token:", e);
          get().clearAuth();
          return false;
        }
      },
    }),
    {
      name: "auth-storage", // LocalStorage key
    }
  )
);
