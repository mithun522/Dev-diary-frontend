export const Languages = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "TYPESCRIPT",
  "REACT",
  "NODE",
  "EXPRESS",
  "MYSQL",
  "GIT",
  "GITHUB",
  "AUTHENTICATION",
  "JEST",
  "CYPRESS",
];

// Personal DSA-log "language" tag (src/pages/dsa/AddDsaModel.tsx) — a coarse label for which
// language a logged solution/notes were written in. Independent of the judge-backed catalog flow
// below; not every CodeExecutionLanguage is offered here.
export const ProgrammingLanguages = {
  JAVASCRIPT: "JAVASCRIPT",
  TYPESCRIPT: "TYPESCRIPT",
  JAVA: "JAVA",
};

// Languages the code-execution judge can compile/run, via dsa-service's catalog endpoints. Values
// match dsa-service's openapi.yaml enum exactly (lowercase) — used as CatalogProblemInput's
// `starterCode` map keys, SubmissionInput.language, and GenerateTestCasesInput's
// referenceSolutionLanguage. Do not change these values without a corresponding backend change.
export const CodeExecutionLanguages = {
  JAVASCRIPT: "javascript",
  TYPESCRIPT: "typescript",
  PYTHON: "python",
  JAVA: "java",
  C: "c",
  CPP: "cpp",
} as const;

export type CodeExecutionLanguage =
  (typeof CodeExecutionLanguages)[keyof typeof CodeExecutionLanguages];

// Only C/C++ submissions carry a meaningful returnType (dsa-service's SubmissionInput.returnType).
export const isReturnTypeLanguage = (language: CodeExecutionLanguage): boolean =>
  language === CodeExecutionLanguages.C || language === CodeExecutionLanguages.CPP;

// Display order/labels for the coding-question language picker.
export const CODE_EXECUTION_LANGUAGE_OPTIONS: { value: CodeExecutionLanguage; label: string }[] = [
  { value: CodeExecutionLanguages.JAVASCRIPT, label: "JavaScript" },
  { value: CodeExecutionLanguages.TYPESCRIPT, label: "TypeScript" },
  { value: CodeExecutionLanguages.PYTHON, label: "Python" },
  { value: CodeExecutionLanguages.JAVA, label: "Java" },
  { value: CodeExecutionLanguages.CPP, label: "C++" },
  { value: CodeExecutionLanguages.C, label: "C" },
];
