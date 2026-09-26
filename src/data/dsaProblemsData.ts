import { type Topic } from "../constants/Topics";
import { type ProgrammingLanguages } from "../constants/Languages";
// Types
export type ProblemStatus = "SOLVED" | "ATTEMPTED" | "UNSOLVED";

export const DifficultyLevels = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type DSAProblem = {
  id?: string;
  problem: string;
  difficulty: (typeof DifficultyLevels)[keyof typeof DifficultyLevels];
  language: (typeof ProgrammingLanguages)[keyof typeof ProgrammingLanguages];
  topics: Topic[];
  link: string;
  status: ProblemStatus;
  createdAt?: string;
  updatedAt?: string; // ISO date string
  notes?: string;
  bruteForceSolution?: string; // Markdown solution
  betterSolution?: string; // Markdown solution
  optimisedSolution?: string; // Markdown solution
};

// One calendar day's catalog + curriculum submission activity for the caller (server-computed,
// GET /dsa/activity/heatmap) — "submissions" counts every attempt, "accepted" the subset that
// scored ACCEPTED. Catalog and curriculum are independent; sum them client-side for a combined
// per-day intensity (e.g. the Progress tab's activity heatmap).
export type DailyActivity = {
  date: string; // "YYYY-MM-DD", no time/timezone component
  catalogSubmissions: number;
  catalogAccepted: number;
  curriculumSubmissions: number;
  curriculumAccepted: number;
};

