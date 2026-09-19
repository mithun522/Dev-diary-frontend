import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchCatalogLanguages,
  fetchCatalogLanguageTree,
  fetchCatalogQuestion,
  searchCatalogQuestions,
} from "../services/techInterviewCatalog.service";
import type { CatalogDifficulty } from "../../data/techInterviewCatalogData";

export const useCatalogLanguages = () => {
  return useQuery({
    queryKey: ["tech-interview-catalog-languages"],
    queryFn: fetchCatalogLanguages,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCatalogLanguageTree = (language: string) => {
  return useQuery({
    queryKey: ["tech-interview-catalog-language", language],
    queryFn: () => fetchCatalogLanguageTree(language),
    enabled: !!language,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCatalogQuestion = (slug: string) => {
  return useQuery({
    queryKey: ["tech-interview-catalog-question", slug],
    queryFn: () => fetchCatalogQuestion(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSearchCatalogQuestions = (
  search: string,
  language?: string,
  difficulty?: CatalogDifficulty
) => {
  return useInfiniteQuery({
    queryKey: ["tech-interview-catalog-search", search, language ?? "", difficulty ?? ""],
    queryFn: ({ pageParam = 1 }) =>
      searchCatalogQuestions(search, pageParam, language, difficulty),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.results).length;
      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: search.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
