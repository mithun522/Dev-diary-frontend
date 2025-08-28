import type { KnowledgeTag } from "../data/knowledgeData";

// Convert comma-separated string to array of KnowledgeTag
export const parseTags = (tagsString: string): KnowledgeTag[] => {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag) as KnowledgeTag[];
};
