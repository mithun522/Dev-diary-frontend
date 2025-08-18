import { create } from "zustand";

type TechInterviewStore = {
  selectedLanguage: string;
  setSelectedLanguage: (selectedLanguage: string) => void;
};

export const TechInterviewStore = create<TechInterviewStore>()((set) => ({
  selectedLanguage: "JAVASCRIPT",
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
}));
