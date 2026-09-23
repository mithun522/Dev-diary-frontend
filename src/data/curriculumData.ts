import type { CodeExecutionLanguage } from "../constants/Languages";

// dsa-service's own difficulty scale for the curriculum track (beginner/basic/easy/medium/
// advanced) — deliberately distinct from the catalog's DifficultyLevels (EASY/MEDIUM/HARD), a
// different track with a different rubric.
export const CurriculumLevels = {
  BEGINNER: "beginner",
  BASIC: "basic",
  EASY: "easy",
  MEDIUM: "medium",
  ADVANCED: "advanced",
} as const;

export type CurriculumLevel =
  (typeof CurriculumLevels)[keyof typeof CurriculumLevels];

export const CURRICULUM_LEVEL_OPTIONS: { value: CurriculumLevel; label: string }[] = [
  { value: CurriculumLevels.BEGINNER, label: "Beginner" },
  { value: CurriculumLevels.BASIC, label: "Basic" },
  { value: CurriculumLevels.EASY, label: "Easy" },
  { value: CurriculumLevels.MEDIUM, label: "Medium" },
  { value: CurriculumLevels.ADVANCED, label: "Advanced" },
];

export const CURRICULUM_LEVEL_COLORS: Record<CurriculumLevel, string> = {
  beginner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  easy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export type CurriculumTopic = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

// afterTopicId: omit to append at the end, null to place first, an existing topic's id to place
// immediately after it — server computes the fractional position, never renumbers siblings.
export type CurriculumTopicInput = {
  slug: string;
  title: string;
  description?: string;
  afterTopicId?: string | null;
};

// One row per (topic, language) exercise — a curriculum problem is single-language by design
// (practicing a language's own print/if/loop/function syntax has no language-agnostic version),
// unlike the catalog's per-language starterCode map.
export type CurriculumProblem = {
  id: string;
  topicId: string;
  slug: string;
  title: string;
  description: string;
  language: CodeExecutionLanguage;
  level: CurriculumLevel;
  starterCode: string;
  position: number;
  // Whether the CALLING user has solved this problem — true once any one of their submissions
  // against it was ACCEPTED. Derived per-request by the backend, never something the client sets.
  solved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CurriculumTestCase = {
  id: string;
  expectedStdout: string;
  isSample: boolean;
};

export type CurriculumProblemDetail = CurriculumProblem & {
  sampleTestCases: CurriculumTestCase[];
};

export type CurriculumTestCaseInput = {
  expectedStdout: string;
  isSample?: boolean;
};

// afterProblemId: same semantics as CurriculumTopicInput.afterTopicId, but for problems within
// the given topic.
export type CurriculumProblemInput = {
  slug: string;
  title: string;
  description: string;
  language: CodeExecutionLanguage;
  level: CurriculumLevel;
  starterCode: string;
  testCases: CurriculumTestCaseInput[];
  afterProblemId?: string | null;
};

// Program-mode result row: only the stdout fields are ever populated for a curriculum problem —
// args/expected/actual (the catalog's function-mode fields) never appear here.
export type CurriculumResultCase = {
  expectedStdout: string;
  actualStdout: string;
  passed: boolean;
  error?: string;
};

export type CurriculumJudgeStatus =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMED_OUT"
  | "COMPILE_ERROR";

export type CurriculumRunResult = {
  status: CurriculumJudgeStatus;
  results: CurriculumResultCase[];
  runtimeMs: number;
};

export type CurriculumSubmission = {
  id: string;
  problemId: string;
  sourceCode: string;
  status: CurriculumJudgeStatus;
  results: CurriculumResultCase[];
  runtimeMs: number;
  createdAt: string;
};

// A single topic's solved/total count, in the curriculum's own topic display order. Topics with
// no problems — or none in the requested language — still appear, as 0/0.
export type CurriculumTopicProgress = {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  total: number;
  solved: number;
};

// The calling user's progress across the whole curriculum, optionally scoped to one language.
export type CurriculumProgress = {
  totalProblems: number;
  solvedProblems: number;
  solvedProblemIds: string[];
  byTopic: CurriculumTopicProgress[];
};
