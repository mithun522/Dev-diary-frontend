export const TodoPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export type DsaTodo = {
  id?: string;
  problem: string;
  link?: string;
  priority?: (typeof TodoPriority)[keyof typeof TodoPriority];
  notes?: string;
  isDone?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
