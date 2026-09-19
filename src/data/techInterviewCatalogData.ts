// Shared, curated technical interview Q&A catalog — read-only, seeded from markdown by
// tech-interview-service's scripts/seedCatalog.js. Distinct from a candidate's own personal Q&A
// bank (TechnicalQuestion in pages/technical-interview/Index.tsx).

export const CatalogDifficulties = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type CatalogDifficulty =
  (typeof CatalogDifficulties)[keyof typeof CatalogDifficulties];

export const CATALOG_DIFFICULTY_COLORS: Record<CatalogDifficulty, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  INTERMEDIATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ADVANCED: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  EXPERT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export type CatalogLanguage = {
  language: string;
  label: string;
  topicCount: number;
  questionCount: number;
};

export type CatalogTopic = {
  slug: string;
  title: string;
  description: string;
};

export type CatalogQuestionSummary = {
  slug: string;
  question: string;
  difficulty: CatalogDifficulty;
};

export type CatalogTopicWithQuestions = CatalogTopic & {
  questions: CatalogQuestionSummary[];
};

export type CatalogLanguageTree = {
  language: string;
  label: string;
  topics: CatalogTopicWithQuestions[];
};

export type CatalogQuestion = CatalogQuestionSummary & {
  language: string;
  topic: string;
  answer: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CatalogSearchResult = CatalogQuestionSummary & {
  language: string;
  topic: string;
};

export type CatalogSearchPage = {
  results: CatalogSearchResult[];
  totalLength: number;
};
