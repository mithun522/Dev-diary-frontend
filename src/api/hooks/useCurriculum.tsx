import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchCurriculumTopics,
  createCurriculumTopic,
  updateCurriculumTopic,
  deleteCurriculumTopic,
  fetchCurriculumProblems,
  createCurriculumProblem,
  fetchCurriculumProblemDetail,
  updateCurriculumProblem,
  deleteCurriculumProblem,
  replaceCurriculumTestCases,
  runCurriculumSolution,
  submitCurriculumSolution,
  fetchCurriculumSubmissions,
} from "../services/curriculum.service";
import type {
  CurriculumProblemInput,
  CurriculumTestCaseInput,
  CurriculumTopicInput,
} from "../../data/curriculumData";
import type { CodeExecutionLanguage } from "../../constants/Languages";

export const useCurriculumTopics = () => {
  return useQuery({
    queryKey: ["curriculum-topics"],
    queryFn: fetchCurriculumTopics,
  });
};

export const useCreateCurriculumTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CurriculumTopicInput) => createCurriculumTopic(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculum-topics"] }),
  });
};

export const useUpdateCurriculumTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CurriculumTopicInput }) =>
      updateCurriculumTopic(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculum-topics"] }),
  });
};

export const useDeleteCurriculumTopic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCurriculumTopic(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculum-topics"] }),
  });
};

export const useCurriculumProblems = (
  topicId: string,
  language?: CodeExecutionLanguage
) => {
  return useQuery({
    queryKey: ["curriculum-problems", topicId, language ?? ""],
    queryFn: () => fetchCurriculumProblems(topicId, language),
    enabled: !!topicId,
  });
};

export const useCreateCurriculumProblem = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CurriculumProblemInput) => createCurriculumProblem(topicId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["curriculum-problems", topicId] }),
  });
};

export const useCurriculumProblemDetail = (id: string) => {
  return useQuery({
    queryKey: ["curriculum-problem", id],
    queryFn: () => fetchCurriculumProblemDetail(id),
    enabled: !!id,
    // Keeps the previous problem on screen while the next one loads, so
    // next/prev navigation can crossfade instead of flashing a skeleton —
    // matters more here since the judge/execution backend is serverless and slow.
    placeholderData: keepPreviousData,
  });
};

export const useUpdateCurriculumProblem = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CurriculumProblemInput }) =>
      updateCurriculumProblem(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-problems", topicId] });
      queryClient.invalidateQueries({ queryKey: ["curriculum-problem", id] });
    },
  });
};

export const useDeleteCurriculumProblem = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCurriculumProblem(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["curriculum-problems", topicId] }),
  });
};

export const useReplaceCurriculumTestCases = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testCases: CurriculumTestCaseInput[]) =>
      replaceCurriculumTestCases(id, testCases),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculum-problem", id] }),
  });
};

// Doesn't persist a submission row, so there's nothing to invalidate.
export const useRunCurriculumSolution = (id: string) => {
  return useMutation({
    mutationFn: (sourceCode: string) => runCurriculumSolution(id, sourceCode),
  });
};

export const useSubmitCurriculumSolution = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceCode: string) => submitCurriculumSolution(id, sourceCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-submissions", id] });
    },
  });
};

export const useCurriculumSubmissions = (id: string) => {
  return useQuery({
    queryKey: ["curriculum-submissions", id],
    queryFn: () => fetchCurriculumSubmissions(id),
    enabled: !!id,
  });
};
