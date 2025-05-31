import { type Topic } from "../constants/Topics";
// Types
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "Solved" | "Attempted" | "Unsolved";

export type DSAProblem = {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  topic: Topic[];
  link: string;
  status: ProblemStatus;
  lastSolved?: string; // ISO date string
  notes?: string;
  solution?: string; // Markdown solution
};

// Progress data
export type DailyProgress = {
  date: string; // ISO date string
  problemsSolved: number;
};

export const weeklyProgress: DailyProgress[] = [
  { date: "2023-09-10", problemsSolved: 3 },
  { date: "2023-09-11", problemsSolved: 2 },
  { date: "2023-09-12", problemsSolved: 5 },
  { date: "2023-09-13", problemsSolved: 1 },
  { date: "2023-09-14", problemsSolved: 4 },
  { date: "2023-09-15", problemsSolved: 2 },
  { date: "2023-09-16", problemsSolved: 3 },
];

export type TopicProgress = {
  topic: string;
  count: number;
};

export const topicProgress: TopicProgress[] = [
  { topic: "Arrays", count: 15 },
  { topic: "Linked List", count: 8 },
  { topic: "Hash Table", count: 12 },
  { topic: "String", count: 10 },
  { topic: "Dynamic Programming", count: 7 },
  { topic: "Tree", count: 9 },
  { topic: "Graph", count: 4 },
  { topic: "Binary Search", count: 6 },
  { topic: "Stack", count: 5 },
  { topic: "Heap", count: 3 },
];

export const DifficultyLevel = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};
