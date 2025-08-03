import { TECHNICAL_INTERVIEW } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";

export const getTechInterviewByLanguage = async (language: string) => {
  const response = await AxiosInstance.get(
    `${TECHNICAL_INTERVIEW}?language=${language}`
  );
  return response.data;
};

export const searchTechInterview = async (
  searchQuery: string,
  language: string
) => {
  const response = await AxiosInstance.get(
    `${TECHNICAL_INTERVIEW}/search?search=${searchQuery}&language=${language}`
  );
  return response.data;
};
