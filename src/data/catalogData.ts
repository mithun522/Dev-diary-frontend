import { type Topic } from "../constants/Topics";
import { DifficultyLevels } from "./dsaProblemsData";
import type { CodeExecutionLanguage } from "../constants/Languages";

export type CatalogDifficulty = (typeof DifficultyLevels)[keyof typeof DifficultyLevels];

// Keyed by CodeExecutionLanguage; a problem doesn't need to offer every language, so at least one
// key is required but the rest are optional (matches dsa-service's CatalogProblemInput.starterCode
// JSONB shape — minProperties: 1).
export type StarterCodeByLanguage = Partial<Record<CodeExecutionLanguage, string>>;

// dsa-service's fixed C/C++ return type enum — a property of the problem (not the submission):
// one shared value used whenever starterCode.c or starterCode.cpp is present. Required in that
// case; code-execution-service looks it up server-side, so candidates never see or send it.
export type CatalogReturnType =
  | "int"
  | "double"
  | "bool"
  | "string"
  | "int[]"
  | "double[]"
  | "bool[]";

export const CATALOG_RETURN_TYPES: CatalogReturnType[] = [
  "int",
  "double",
  "bool",
  "string",
  "int[]",
  "double[]",
  "bool[]",
];

export type CatalogProblem = {
  id: string;
  slug: string;
  title: string;
  difficulty: CatalogDifficulty;
  topics: Topic[];
  description: string;
  functionName: string;
  paramNames: string[];
  starterCode: StarterCodeByLanguage;
  returnType?: CatalogReturnType;
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

export type JudgeStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMED_OUT"
  | "COMPILE_ERROR";

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
  language: CodeExecutionLanguage;
  createdAt: string;
};
