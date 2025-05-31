import type { KnowledgeTag } from "../../data/knowledgeData";

export const getTagColor = (tag: KnowledgeTag): string => {
  const colors: Record<KnowledgeTag, string> = {
    algorithms: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "data-structures":
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    javascript:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    python:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "system-design":
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    behavioral: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    frontend:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    backend: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    database: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    networking: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    security: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
    architecture:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  };
  return colors[tag];
};
