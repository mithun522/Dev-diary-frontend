import {
  CATALOG,
  CATALOG_GENERATE_TEST_CASES,
  CATALOG_RUN,
  CATALOG_SUBMISSIONS,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  CatalogProblemDetail,
  CatalogProblemPage,
  JudgeResult,
  SampleTestCase,
  Submission,
} from "../../data/catalogData";

export const fetchCatalogProblems = async (
  search: string = "",
  difficulty: string,
  pageParam: number
): Promise<CatalogProblemPage> => {
  const params = new URLSearchParams();

  if (search) params.append("searchString", search);
  if (difficulty) params.append("difficulty", difficulty);
  if (pageParam) params.append("pageNumber", String(pageParam));

  const queryString = params.toString();
  const url = queryString ? `${CATALOG}?${queryString}` : CATALOG;

  const response = await AxiosInstance.get(url);
  return response.data;
};

export const fetchCatalogProblemDetail = async (
  id: string
): Promise<CatalogProblemDetail> => {
  const response = await AxiosInstance.get(`${CATALOG}/${id}`);
  return response.data;
};

export const fetchSubmissions = async (id: string): Promise<Submission[]> => {
  const response = await AxiosInstance.get(CATALOG_SUBMISSIONS(id));
  return response.data;
};

export const submitSolution = async (
  id: string,
  sourceCode: string
): Promise<Submission> => {
  const response = await AxiosInstance.post(CATALOG_SUBMISSIONS(id), {
    sourceCode,
  });
  return response.data;
};

export const runSolution = async (
  id: string,
  sourceCode: string
): Promise<JudgeResult> => {
  const response = await AxiosInstance.post(CATALOG_RUN(id), {
    sourceCode,
  });
  return response.data;
};

// Admin-only: asks the backend to (re)generate this problem's test cases. `referenceSolution` is
// required by the backend (GenerateTestCasesInput) — a known-correct JS implementation it runs
// LLM-proposed inputs through to compute real `expected` values. Doesn't persist anything by
// itself — the admin form replaces its testCases field array with the response for review, then
// saves via updateCatalogProblem like any other edit.
export const generateTestCases = async (
  id: string,
  referenceSolution: string
): Promise<SampleTestCase[]> => {
  const response = await AxiosInstance.post(CATALOG_GENERATE_TEST_CASES(id), {
    referenceSolution,
  });
  // Response is GenerateTestCasesResult: {requested, generated, duplicatesSkipped, inserted, testCases}
  return response.data?.testCases ?? [];
};
