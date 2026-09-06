import { LANGUAGE_BY_ID } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type { LanguageType } from "../hooks/useFetchLanguage";

// POST /language (create) already has a working frontend implementation — reuse
// addLanguage/useAddLanguage from language.service.tsx / useFetchLanguage.tsx rather than
// duplicating it here. This file only adds the two admin-only operations (update/delete) that
// don't exist yet.
export const updateLanguage = async (
  id: string,
  language: string
): Promise<LanguageType> => {
  const response = await AxiosInstance.put(LANGUAGE_BY_ID(id), { language });
  return response.data;
};

export const deleteLanguage = async (id: string): Promise<void> => {
  await AxiosInstance.delete(LANGUAGE_BY_ID(id));
};
