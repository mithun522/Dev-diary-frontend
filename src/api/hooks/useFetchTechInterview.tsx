import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getTechInterviewByLanguage,
  searchTechInterview,
} from "../services/techInterview.service";
import { type TechnicalQuestion } from "../../pages/technical-interview/Index";

export const useFetchTechInterview = (language: string) => {
  return useQuery<TechnicalQuestion[], Error>({
    queryKey: ["techInterview", language],
    queryFn: async () => {
      const response = await getTechInterviewByLanguage(language);
      return response;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: language !== "all",
  } as UseQueryOptions<TechnicalQuestion[], Error>);
};

export const useSearchTechInterview = (
  searchQuery: string,
  language: string
) => {
  return useQuery<TechnicalQuestion[], Error>({
    queryKey: ["searchTechInterview", searchQuery, language],
    queryFn: async () => {
      const response = await searchTechInterview(searchQuery, language);
      return response;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: language !== "all",
  } as UseQueryOptions<TechnicalQuestion[], Error>);
};
