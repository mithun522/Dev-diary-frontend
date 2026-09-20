import {
  TECH_INTERVIEW_CATALOG_CATEGORIES,
  TECH_INTERVIEW_CATALOG_STACK_BY_ID,
  TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG,
  TECH_INTERVIEW_CATALOG_SEARCH,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CatalogCategory,
  CatalogStackTree,
  CatalogQuestion,
  CatalogSearchPage,
  CatalogDifficulty,
} from "../../data/techInterviewCatalogData";

export const fetchCatalogCategories = async (): Promise<CatalogCategory[]> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_CATEGORIES);
  return response.data;
};

export const fetchCatalogStack = async (stack: string): Promise<CatalogStackTree> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_STACK_BY_ID(stack));
  return response.data;
};

export const fetchCatalogQuestion = async (slug: string): Promise<CatalogQuestion> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG(slug));
  return response.data;
};

export type SearchCatalogQuestionsParams = {
  q: string;
  category?: string;
  stack?: string;
  difficulty?: CatalogDifficulty;
  page?: number;
};

export const searchCatalogQuestions = async ({
  q,
  category,
  stack,
  difficulty,
  page,
}: SearchCatalogQuestionsParams): Promise<CatalogSearchPage> => {
  const params = new URLSearchParams({ q });
  if (category) params.set("category", category);
  if (stack) params.set("stack", stack);
  if (difficulty) params.set("difficulty", difficulty);
  if (page && page > 1) params.set("page", String(page));

  const response = await AxiosInstance.get(
    `${TECH_INTERVIEW_CATALOG_SEARCH}?${params.toString()}`
  );
  return response.data;
};
