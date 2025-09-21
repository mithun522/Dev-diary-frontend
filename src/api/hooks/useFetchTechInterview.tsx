import {
  useQuery,
  type UseQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getTechInterviewByLanguage,
  searchTechInterview,
} from "../services/techInterview.service";
import { type TechnicalQuestion } from "../../pages/technical-interview/Index";

export const useFetchTechInterview = (language: string) => {
  return useInfiniteQuery({
    queryKey: ["techInterview", language],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getTechInterviewByLanguage(language, pageParam);
      return {
        questions: response.techInterview,
        total: response.techInterviewTotalLength,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.questions).length;
      if (totalLoaded < lastPage.total) {
        return allPages.length + 1; // fetch next page
      }
      return undefined; // no more pages
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFetchTechInterviewLength = (language: string) => {
  return useQuery<number, Error>({
    queryKey: ["techInterviewLength", language],
    queryFn: async () => {
      const response = await getTechInterviewByLanguage(language, 1);
      return response.techInterviewTotalLength; // ✅ fixed
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  } as UseQueryOptions<number, Error>);
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
    gcTime: 10 * 60 * 1000,
    enabled: searchQuery.trim().length > 0, // ✅ avoids empty search calls
  } as UseQueryOptions<TechnicalQuestion[], Error>);
};
