import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCatalogProblemDetail,
  fetchCatalogProblems,
  fetchSubmissions,
  generateTestCases,
  runSolution,
  submitSolution,
} from "../services/catalog.service";
import type { CatalogProblemPage } from "../../data/catalogData";
import type { CodeExecutionLanguage } from "../../constants/Languages";

interface RunOrSubmitInput {
  sourceCode: string;
  language: CodeExecutionLanguage;
}

interface GenerateTestCasesInput {
  referenceSolution: string;
  referenceSolutionLanguage: CodeExecutionLanguage;
  referenceSolutionReturnType?: string;
}

interface FetchCatalogProps {
  search: string;
  difficulty: string;
}

export const useFetchCatalogProblems = ({ search, difficulty }: FetchCatalogProps) => {
  return useInfiniteQuery<CatalogProblemPage, Error>({
    queryKey: ["catalog", search ?? "", difficulty ?? "NONE"],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchCatalogProblems(search, difficulty, Number(pageParam));
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.problems).length;

      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFetchCatalogProblemDetail = (id?: string) => {
  return useQuery({
    queryKey: ["catalog", "problem", id],
    queryFn: () => fetchCatalogProblemDetail(id as string),
    enabled: !!id,
  });
};

export const useFetchSubmissions = (id?: string) => {
  return useQuery({
    queryKey: ["catalog", "submissions", id],
    queryFn: () => fetchSubmissions(id as string),
    enabled: !!id,
  });
};

export const useSubmitSolution = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceCode, language }: RunOrSubmitInput) =>
      submitSolution(id, sourceCode, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "submissions", id] });
    },
  });
};

// Doesn't persist a submission row, so there's nothing to invalidate.
export const useRunSolution = (id: string) => {
  return useMutation({
    mutationFn: ({ sourceCode, language }: RunOrSubmitInput) => runSolution(id, sourceCode, language),
  });
};

// Admin-only: (re)generate a catalog problem's test cases for review. Doesn't persist anything
// itself, so nothing to invalidate — the admin form saves the reviewed result via a normal
// updateCatalogProblem call.
export const useGenerateTestCases = (id: string) => {
  return useMutation({
    mutationFn: ({
      referenceSolution,
      referenceSolutionLanguage,
      referenceSolutionReturnType,
    }: GenerateTestCasesInput) =>
      generateTestCases(
        id,
        referenceSolution,
        referenceSolutionLanguage,
        referenceSolutionReturnType
      ),
  });
};
