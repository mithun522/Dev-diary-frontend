import { LANGUAGE } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import { logger } from "../../utils/logger";
import type { LanguageType } from "../hooks/useFetchLanguage";

export const fetchLanguage = async () => {
  try {
    const response = await AxiosInstance.get(LANGUAGE);
    return response.data;
  } catch (err) {
    logger.error(err);
  }
};

export const addLanguage = async (
  languageName: string
): Promise<LanguageType> => {
  const response = await AxiosInstance.post(LANGUAGE, {
    language: languageName,
  });
  return response.data;
};
