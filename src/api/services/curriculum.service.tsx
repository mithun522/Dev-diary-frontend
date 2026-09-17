import {
  CURRICULUM_TOPICS,
  CURRICULUM_TOPIC_BY_ID,
  CURRICULUM_TOPIC_PROBLEMS,
  CURRICULUM_PROBLEM_BY_ID,
  CURRICULUM_PROBLEM_TEST_CASES,
  CURRICULUM_PROBLEM_RUN,
  CURRICULUM_PROBLEM_SUBMISSIONS,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CurriculumTopic,
  CurriculumTopicInput,
  CurriculumProblem,
  CurriculumProblemDetail,
  CurriculumProblemInput,
  CurriculumTestCase,
  CurriculumTestCaseInput,
  CurriculumRunResult,
  CurriculumSubmission,
} from "../../data/curriculumData";
import type { CodeExecutionLanguage } from "../../constants/Languages";

export const fetchCurriculumTopics = async (): Promise<CurriculumTopic[]> => {
  const response = await AxiosInstance.get(CURRICULUM_TOPICS);
  return response.data;
};

export const createCurriculumTopic = async (
  payload: CurriculumTopicInput
): Promise<CurriculumTopic> => {
  const response = await AxiosInstance.post(CURRICULUM_TOPICS, payload);
  return response.data;
};

export const updateCurriculumTopic = async (
  id: string,
  payload: CurriculumTopicInput
): Promise<CurriculumTopic> => {
  const response = await AxiosInstance.put(CURRICULUM_TOPIC_BY_ID(id), payload);
  return response.data;
};

export const deleteCurriculumTopic = async (id: string): Promise<void> => {
  await AxiosInstance.delete(CURRICULUM_TOPIC_BY_ID(id));
};

export const fetchCurriculumProblems = async (
  topicId: string,
  language?: CodeExecutionLanguage
): Promise<CurriculumProblem[]> => {
  const url = language
    ? `${CURRICULUM_TOPIC_PROBLEMS(topicId)}?language=${language}`
    : CURRICULUM_TOPIC_PROBLEMS(topicId);
  const response = await AxiosInstance.get(url);
  return response.data;
};

export const createCurriculumProblem = async (
  topicId: string,
  payload: CurriculumProblemInput
): Promise<CurriculumProblem> => {
  const response = await AxiosInstance.post(CURRICULUM_TOPIC_PROBLEMS(topicId), payload);
  return response.data;
};

export const fetchCurriculumProblemDetail = async (
  id: string
): Promise<CurriculumProblemDetail> => {
  const response = await AxiosInstance.get(CURRICULUM_PROBLEM_BY_ID(id));
  return response.data;
};

export const updateCurriculumProblem = async (
  id: string,
  payload: CurriculumProblemInput
): Promise<CurriculumProblem> => {
  const response = await AxiosInstance.put(CURRICULUM_PROBLEM_BY_ID(id), payload);
  return response.data;
};

export const deleteCurriculumProblem = async (id: string): Promise<void> => {
  await AxiosInstance.delete(CURRICULUM_PROBLEM_BY_ID(id));
};

export const replaceCurriculumTestCases = async (
  id: string,
  testCases: CurriculumTestCaseInput[]
): Promise<CurriculumTestCase[]> => {
  const response = await AxiosInstance.put(CURRICULUM_PROBLEM_TEST_CASES(id), { testCases });
  return response.data;
};

// Judges only the sample test case(s) and does not persist a submission row — used for "Run".
export const runCurriculumSolution = async (
  id: string,
  sourceCode: string
): Promise<CurriculumRunResult> => {
  const response = await AxiosInstance.post(CURRICULUM_PROBLEM_RUN(id), { sourceCode });
  return response.data;
};

export const submitCurriculumSolution = async (
  id: string,
  sourceCode: string
): Promise<CurriculumSubmission> => {
  const response = await AxiosInstance.post(CURRICULUM_PROBLEM_SUBMISSIONS(id), { sourceCode });
  return response.data;
};

export const fetchCurriculumSubmissions = async (
  id: string
): Promise<CurriculumSubmission[]> => {
  const response = await AxiosInstance.get(CURRICULUM_PROBLEM_SUBMISSIONS(id));
  return response.data;
};
