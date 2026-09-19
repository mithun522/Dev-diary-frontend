import {
  TECH_INTERVIEW_CATALOG_LANGUAGES,
  TECH_INTERVIEW_CATALOG_LANGUAGE_BY_ID,
  TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG,
  TECH_INTERVIEW_CATALOG_SEARCH,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CatalogLanguage,
  CatalogLanguageTree,
  CatalogQuestion,
  CatalogSearchPage,
  CatalogDifficulty,
} from "../../data/techInterviewCatalogData";

export const fetchCatalogLanguages = async (): Promise<CatalogLanguage[]> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_LANGUAGES);
  return response.data;
};

export const fetchCatalogLanguageTree = async (
  language: string
): Promise<CatalogLanguageTree> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_LANGUAGE_BY_ID(language));
  return response.data;
};

export const fetchCatalogQuestion = async (slug: string): Promise<CatalogQuestion> => {
  const response = await AxiosInstance.get(TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG(slug));
  return response.data;
};

export const searchCatalogQuestions = async (
  search: string,
  page: number,
  language?: string,
  difficulty?: CatalogDifficulty
): Promise<CatalogSearchPage> => {
  const params = new URLSearchParams({ q: search, page: String(page) });
  if (language) params.set("language", language);
  if (difficulty) params.set("difficulty", difficulty);

  const response = await AxiosInstance.get(
    `${TECH_INTERVIEW_CATALOG_SEARCH}?${params.toString()}`
  );
  return response.data;
};
