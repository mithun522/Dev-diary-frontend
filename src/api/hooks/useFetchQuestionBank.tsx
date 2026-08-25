import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchQuestionBankFiles } from "../services/questionBank.service";
import type { QuestionBankFile } from "../../data/questionBankData";

export const QUESTION_BANK_QUERY_KEY = ["questionBank"];

export const useFetchQuestionBank = (): UseQueryResult<
  QuestionBankFile[],
  Error
> => {
  return useQuery({
    queryKey: QUESTION_BANK_QUERY_KEY,
    queryFn: fetchQuestionBankFiles,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
