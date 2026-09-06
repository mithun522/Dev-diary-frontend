// Admin CRUD for the interview-simulator-service's content: mock interviews (+ nested
// per-interview questions), company problems, and behavioral questions. All endpoints are
// `requireAdmin`-gated on the backend (see plan doc) — mirrors catalog.service.tsx's pattern of
// thin AxiosInstance wrappers, one per endpoint.
//
// Reuses the read-side entity shapes already defined for the public Interview Simulator page
// (`MockInterview`, `CompanyProblem`, `BehavioralQuestion` from data/interviewData.ts) rather than
// redefining them. That page currently renders from static local data — there is no existing
// react-query read-hook for these endpoints to reuse yet, so the list/detail queries below are new.
import {
  MOCK_INTERVIEWS,
  MOCK_INTERVIEW_BY_ID,
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_INTERVIEW_QUESTION_BY_ID,
  COMPANY_PROBLEMS,
  COMPANY_PROBLEM_BY_ID,
  BEHAVIORAL_QUESTIONS,
  BEHAVIORAL_QUESTION_BY_ID,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  MockInterview,
  CompanyProblem,
  BehavioralQuestion,
} from "../../data/interviewData";
import type { QuestionType } from "../../data/interviewQuestions";

export type MockInterviewInput = {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  topics: string[];
  rating: number;
};

// The backend's per-question shape: everything type-specific (mcq options, coding boilerplate/
// test cases, frontend requirements, etc.) lives in the free-form `data` object rather than as
// bespoke top-level fields — see the plan's convention for polymorphic JSONB fields. This is
// deliberately flatter than data/interviewQuestions.ts's `Question` union (which models the local
// demo data), so it's defined here rather than reused.
export type MockInterviewQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  timeLimit?: number;
  data: Record<string, unknown>;
};

export type QuestionInput = {
  type: QuestionType;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  timeLimit: number;
  data: Record<string, unknown>;
};

export type CompanyProblemInput = {
  company: string;
  title: string;
  link: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
};

export type BehavioralQuestionInput = {
  question: string;
  category: string;
  tips: string[];
};

// ---- mock interviews ----

export const fetchMockInterviews = async (): Promise<MockInterview[]> => {
  const response = await AxiosInstance.get(MOCK_INTERVIEWS);
  return response.data;
};

export const createMockInterview = async (
  input: MockInterviewInput
): Promise<MockInterview> => {
  const response = await AxiosInstance.post(MOCK_INTERVIEWS, input);
  return response.data;
};

export const updateMockInterview = async (
  id: string,
  input: MockInterviewInput
): Promise<MockInterview> => {
  const response = await AxiosInstance.put(MOCK_INTERVIEW_BY_ID(id), input);
  return response.data;
};

export const deleteMockInterview = async (id: string): Promise<void> => {
  await AxiosInstance.delete(MOCK_INTERVIEW_BY_ID(id));
};

// ---- mock interview questions (nested under a mock interview) ----

export const fetchMockInterviewQuestions = async (
  interviewId: string
): Promise<MockInterviewQuestion[]> => {
  const response = await AxiosInstance.get(
    MOCK_INTERVIEW_QUESTIONS(interviewId)
  );
  return response.data;
};

export const createMockInterviewQuestion = async (
  interviewId: string,
  input: QuestionInput
): Promise<MockInterviewQuestion> => {
  const response = await AxiosInstance.post(
    MOCK_INTERVIEW_QUESTIONS(interviewId),
    input
  );
  return response.data;
};

export const updateMockInterviewQuestion = async (
  interviewId: string,
  questionId: string,
  input: QuestionInput
): Promise<MockInterviewQuestion> => {
  const response = await AxiosInstance.put(
    MOCK_INTERVIEW_QUESTION_BY_ID(interviewId, questionId),
    input
  );
  return response.data;
};

export const deleteMockInterviewQuestion = async (
  interviewId: string,
  questionId: string
): Promise<void> => {
  await AxiosInstance.delete(
    MOCK_INTERVIEW_QUESTION_BY_ID(interviewId, questionId)
  );
};

// ---- company problems ----

export const fetchCompanyProblems = async (): Promise<CompanyProblem[]> => {
  const response = await AxiosInstance.get(COMPANY_PROBLEMS);
  return response.data;
};

export const createCompanyProblem = async (
  input: CompanyProblemInput
): Promise<CompanyProblem> => {
  const response = await AxiosInstance.post(COMPANY_PROBLEMS, input);
  return response.data;
};

export const updateCompanyProblem = async (
  id: string,
  input: CompanyProblemInput
): Promise<CompanyProblem> => {
  const response = await AxiosInstance.put(COMPANY_PROBLEM_BY_ID(id), input);
  return response.data;
};

export const deleteCompanyProblem = async (id: string): Promise<void> => {
  await AxiosInstance.delete(COMPANY_PROBLEM_BY_ID(id));
};

// ---- behavioral questions ----

export const fetchBehavioralQuestions = async (): Promise<
  BehavioralQuestion[]
> => {
  const response = await AxiosInstance.get(BEHAVIORAL_QUESTIONS);
  return response.data;
};

export const createBehavioralQuestion = async (
  input: BehavioralQuestionInput
): Promise<BehavioralQuestion> => {
  const response = await AxiosInstance.post(BEHAVIORAL_QUESTIONS, input);
  return response.data;
};

export const updateBehavioralQuestion = async (
  id: string,
  input: BehavioralQuestionInput
): Promise<BehavioralQuestion> => {
  const response = await AxiosInstance.put(
    BEHAVIORAL_QUESTION_BY_ID(id),
    input
  );
  return response.data;
};

export const deleteBehavioralQuestion = async (id: string): Promise<void> => {
  await AxiosInstance.delete(BEHAVIORAL_QUESTION_BY_ID(id));
};
