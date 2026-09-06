import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMockInterviews,
  createMockInterview,
  updateMockInterview,
  deleteMockInterview,
  fetchMockInterviewQuestions,
  createMockInterviewQuestion,
  updateMockInterviewQuestion,
  deleteMockInterviewQuestion,
  fetchCompanyProblems,
  createCompanyProblem,
  updateCompanyProblem,
  deleteCompanyProblem,
  fetchBehavioralQuestions,
  createBehavioralQuestion,
  updateBehavioralQuestion,
  deleteBehavioralQuestion,
  type MockInterviewInput,
  type QuestionInput,
  type CompanyProblemInput,
  type BehavioralQuestionInput,
} from "../services/adminInterviewSimulator.service";

// ---- mock interviews ----

const MOCK_INTERVIEWS_KEY = ["admin-mock-interviews"];

export const useFetchMockInterviews = () => {
  return useQuery({
    queryKey: MOCK_INTERVIEWS_KEY,
    queryFn: fetchMockInterviews,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMockInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MockInterviewInput) => createMockInterview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOCK_INTERVIEWS_KEY });
    },
  });
};

export const useUpdateMockInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MockInterviewInput }) =>
      updateMockInterview(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOCK_INTERVIEWS_KEY });
    },
  });
};

export const useDeleteMockInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMockInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOCK_INTERVIEWS_KEY });
    },
  });
};

// ---- mock interview questions (nested under a mock interview) ----

const mockInterviewQuestionsKey = (interviewId: string) => [
  "admin-mock-interview-questions",
  interviewId,
];

export const useFetchMockInterviewQuestions = (interviewId?: string) => {
  return useQuery({
    queryKey: mockInterviewQuestionsKey(interviewId ?? ""),
    queryFn: () => fetchMockInterviewQuestions(interviewId as string),
    enabled: !!interviewId,
  });
};

export const useCreateMockInterviewQuestion = (interviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuestionInput) =>
      createMockInterviewQuestion(interviewId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockInterviewQuestionsKey(interviewId),
      });
    },
  });
};

export const useUpdateMockInterviewQuestion = (interviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: QuestionInput;
    }) => updateMockInterviewQuestion(interviewId, questionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockInterviewQuestionsKey(interviewId),
      });
    },
  });
};

export const useDeleteMockInterviewQuestion = (interviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) =>
      deleteMockInterviewQuestion(interviewId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mockInterviewQuestionsKey(interviewId),
      });
    },
  });
};

// ---- company problems ----

const COMPANY_PROBLEMS_KEY = ["admin-company-problems"];

export const useFetchCompanyProblems = () => {
  return useQuery({
    queryKey: COMPANY_PROBLEMS_KEY,
    queryFn: fetchCompanyProblems,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCompanyProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyProblemInput) => createCompanyProblem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_PROBLEMS_KEY });
    },
  });
};

export const useUpdateCompanyProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyProblemInput }) =>
      updateCompanyProblem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_PROBLEMS_KEY });
    },
  });
};

export const useDeleteCompanyProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCompanyProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_PROBLEMS_KEY });
    },
  });
};

// ---- behavioral questions ----

const BEHAVIORAL_QUESTIONS_KEY = ["admin-behavioral-questions"];

export const useFetchBehavioralQuestions = () => {
  return useQuery({
    queryKey: BEHAVIORAL_QUESTIONS_KEY,
    queryFn: fetchBehavioralQuestions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBehavioralQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BehavioralQuestionInput) =>
      createBehavioralQuestion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BEHAVIORAL_QUESTIONS_KEY });
    },
  });
};

export const useUpdateBehavioralQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: BehavioralQuestionInput;
    }) => updateBehavioralQuestion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BEHAVIORAL_QUESTIONS_KEY });
    },
  });
};

export const useDeleteBehavioralQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBehavioralQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BEHAVIORAL_QUESTIONS_KEY });
    },
  });
};
