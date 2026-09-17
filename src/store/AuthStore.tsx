import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "../utils/logger";
import { getAccessToken } from "../utils/auth";

interface AuthState {
  token: string | null;
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  validateToken: () => Promise<boolean>;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
  isSuperAdmin?: boolean;
}

const claimsFrom = (decoded: JwtPayload) => ({
  userId: decoded.sub,
  role: decoded.role ?? null,
  isAdmin: decoded.role === "admin",
  isSuperAdmin: Boolean(decoded.isSuperAdmin),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      role: null,
      isAdmin: false,
      isSuperAdmin: false,
      setAuth: (token: string) => {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          set({ token, ...claimsFrom(decoded) });
        } catch (e) {
          logger.error("Invalid token:", e);
        }
      },
      clearAuth: () =>
        set({ token: null, userId: null, role: null, isAdmin: false, isSuperAdmin: false }),
      validateToken: async () => {
        // "accessToken" is the same key setAccessToken/getAccessToken (src/utils/auth.tsx) use
        // everywhere else — this used to read a stale "token" key that nothing ever wrote to.
        const token = getAccessToken() || get().token;
        if (!token) return false;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const isValid = decoded.exp * 1000 > Date.now();

          if (isValid) {
            set({ token, ...claimsFrom(decoded) });
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
