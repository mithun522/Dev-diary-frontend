import { useQuery } from "@tanstack/react-query";
import {
  fetchCatalogCategories,
  fetchCatalogStack,
  fetchCatalogQuestion,
  searchCatalogQuestions,
  type SearchCatalogQuestionsParams,
} from "../services/techInterviewCatalog.service";

export const useCatalogCategories = () => {
  return useQuery({
    queryKey: ["tech-interview-catalog-categories"],
    queryFn: fetchCatalogCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCatalogStack = (stack: string) => {
  return useQuery({
    queryKey: ["tech-interview-catalog-stack", stack],
    queryFn: () => fetchCatalogStack(stack),
    enabled: !!stack,
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

// The gateway rejects a missing/empty `q` with 400 before the request lands, so `enabled` guards
// against firing one. Page-based (not infinite-scroll) since the backend returns an explicit
// page/pageSize/totalLength rather than a cursor, which suits a shareable `?page=` URL better.
export const useSearchCatalogQuestions = (params: SearchCatalogQuestionsParams) => {
  const { q, category, stack, difficulty, page } = params;
  return useQuery({
    queryKey: [
      "tech-interview-catalog-search",
      q,
      category ?? "",
      stack ?? "",
      difficulty ?? "",
      page ?? 1,
    ],
    queryFn: () => searchCatalogQuestions(params),
    enabled: q.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
