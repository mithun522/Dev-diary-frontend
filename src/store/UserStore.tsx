import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./AuthStore";
import { USERS } from "../constants/Api";
import AxiosInstance from "../utils/AxiosInstance";

// Define your profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface UserStore {
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
          const res = await AxiosInstance.get(`${USERS}/${userId}`);

          set({ user: res.data });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
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
