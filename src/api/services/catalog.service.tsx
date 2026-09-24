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
import {
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../constants/Languages";

export const fetchCatalogProblems = async (
  search: string = "",
  difficulty: string,
  pageParam: number,
  section: string = ""
): Promise<CatalogProblemPage> => {
  const params = new URLSearchParams();

  if (search) params.append("searchString", search);
  if (difficulty) params.append("difficulty", difficulty);
  if (pageParam) params.append("pageNumber", String(pageParam));
  // Exact match against one of the 18 curriculum bands (see CatalogSections.ts) - never a
  // free-text/partial filter, so no encoding concerns beyond URLSearchParams' own.
  if (section) params.append("section", section);

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

// C/C++ return type is a property of the *problem* (CatalogProblem.returnType, set once by the
// admin alongside its starter code) — dsa-service looks it up server-side and forwards it to
// code-execution-service itself. SubmissionInput is just { sourceCode, language }; candidates
// never see or send a return type.
export const submitSolution = async (
  id: string,
  sourceCode: string,
  language: CodeExecutionLanguage = CodeExecutionLanguages.JAVASCRIPT
): Promise<Submission> => {
  const response = await AxiosInstance.post(CATALOG_SUBMISSIONS(id), {
    sourceCode,
    language,
  });
  return response.data;
};

export const runSolution = async (
  id: string,
  sourceCode: string,
  language: CodeExecutionLanguage = CodeExecutionLanguages.JAVASCRIPT
): Promise<JudgeResult> => {
  const response = await AxiosInstance.post(CATALOG_RUN(id), {
    sourceCode,
    language,
  });
  return response.data;
};

// Admin-only: asks the backend to (re)generate this problem's test cases. `referenceSolution` is
// required by the backend (GenerateTestCasesInput) — a known-correct implementation, in
// `referenceSolutionLanguage`, it runs LLM-proposed inputs through to compute real `expected`
// values. `referenceSolutionReturnType` is only meaningful when that language is c/cpp. Doesn't
// persist anything by itself — the admin form replaces its testCases field array with the response
// for review, then saves via updateCatalogProblem like any other edit.
export const generateTestCases = async (
  id: string,
  referenceSolution: string,
  referenceSolutionLanguage: CodeExecutionLanguage = CodeExecutionLanguages.JAVASCRIPT,
  referenceSolutionReturnType?: string
): Promise<SampleTestCase[]> => {
  const response = await AxiosInstance.post(CATALOG_GENERATE_TEST_CASES(id), {
    referenceSolution,
    referenceSolutionLanguage,
    ...(referenceSolutionReturnType ? { referenceSolutionReturnType } : {}),
  });
  // Response is GenerateTestCasesResult: {requested, generated, duplicatesSkipped, inserted, testCases}
  return response.data?.testCases ?? [];
};
