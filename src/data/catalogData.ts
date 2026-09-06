import { type Topic } from "../constants/Topics";
import { DifficultyLevels } from "./dsaProblemsData";

export type CatalogDifficulty = (typeof DifficultyLevels)[keyof typeof DifficultyLevels];

export type CatalogProblem = {
  id: string;
  slug: string;
  title: string;
  difficulty: CatalogDifficulty;
  topics: Topic[];
  description: string;
  functionName: string;
  paramNames: string[];
  starterCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SampleTestCase = {
  id: string;
  args: unknown[];
  expected: unknown;
  isSample: boolean;
};

export type CatalogProblemDetail = CatalogProblem & {
  sampleTestCases: SampleTestCase[];
};

export type CatalogProblemPage = {
  problems: CatalogProblem[];
  totalLength: number;
};

export type JudgeStatus = "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIMED_OUT";

export type JudgeCaseResult = {
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  passed: boolean;
  error?: string;
};

// Shared response shape for both a "Run" (code-execution-service's raw /execute) and a "Submit"
// (dsa-service's /catalog/:id/submissions, which additionally persists the row).
export type JudgeResult = {
  status: JudgeStatus;
  results: JudgeCaseResult[];
  runtimeMs: number;
};

export type Submission = JudgeResult & {
  id: string;
  problemId: string;
  sourceCode: string;
  createdAt: string;
};
