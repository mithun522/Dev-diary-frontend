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

// Progress data
export type DailyProgress = {
  date: string; // ISO date string
  problemsSolved: number;
};

