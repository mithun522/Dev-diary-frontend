import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userId: string | null;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  validateToken: () => Promise<boolean>;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          set({
            token,
            userId: decoded.sub,
          });
        } catch (e) {
          console.error("Invalid token:", e);
        }
      },
      clearAuth: () => set({ token: null, userId: null }),
      validateToken: async () => {
        const token = localStorage.getItem("token") || get().token;
        if (!token) return false;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const isValid = decoded.exp * 1000 > Date.now();

          if (isValid) {
            set({ token, userId: decoded.sub });
          } else {
            get().clearAuth();
          }

          return isValid;
        } catch (e) {
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
