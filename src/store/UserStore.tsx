import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./AuthStore";
import { SINGLE_USER } from "../constants/Api";
import AxiosInstance from "../utils/AxiosInstance";
import { logger } from "../utils/logger";

// Define your profile type
export interface UserProfile {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  professionalDetails: {
    designation?: string;
    currentRole: string;
    location?: string;
    companyName?: string;
    experience?: string;
    skills?: string[];
  };
  socialLinks: {
    linkedIn?: string;
    github?: string;
    personalPortfolio?: string;
  };
  createdAt?: string;
}

export interface UserStore {
  user: UserProfile | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,

      fetchUser: async () => {
        try {
          const userId = useAuthStore.getState().userId;
          const res = await AxiosInstance.get(`${SINGLE_USER}/${userId}`);
          set({ user: res.data });
        } catch (error) {
          logger.error("Failed to fetch user profile:", error);
        }
      },

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-profile-store",
    }
  )
);
