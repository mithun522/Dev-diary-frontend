// Shared, curated technical interview Q&A catalog — read-only, seeded from markdown by
// tech-interview-service's scripts. Distinct from a candidate's own personal Q&A bank
// (TechnicalQuestion in pages/technical-interview/Index.tsx).
//
// Four-tier taxonomy: category -> stack -> topic -> question (e.g. cloud -> aws -> lambda ->
// "What causes a cold start?"). New stacks/topics/questions are seeded server-side at any time —
// never hardcode a category or stack list, always drive the UI from `categories`.

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

export type CatalogStackSummary = {
  stack: string;
  label: string;
  topicCount: number;
  questionCount: number;
};

export type CatalogCategory = {
  slug: string;
  label: string;
  stacks: CatalogStackSummary[];
};

export type CatalogQuestionSummary = {
  slug: string;
  question: string;
  difficulty: CatalogDifficulty;
};

export type CatalogTopic = {
  slug: string;
  title: string;
  description: string;
  questions: CatalogQuestionSummary[];
};

export type CatalogStackTree = {
  stack: string;
  label: string;
  category: string;
  categoryLabel: string;
  topics: CatalogTopic[];
};

export type CatalogQuestion = CatalogQuestionSummary & {
  category: string;
  categoryLabel: string;
  stack: string;
  stackLabel: string;
  topic: string;
  topicTitle: string;
  answer: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogSearchResult = CatalogQuestionSummary & {
  category: string;
  stack: string;
  stackLabel: string;
  topic: string;
};

export type CatalogSearchPage = {
  results: CatalogSearchResult[];
  totalLength: number;
  page: number;
  pageSize: number;
};
