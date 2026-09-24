// The 18 curriculum bands dsa-service's catalog is organized into, in beginner-to-advanced order
// (see scripts/catalog/index.js's SECTIONS in dsa-service - this list must stay in sync with it).
// CatalogProblem.section holds one of these values (or null, for a problem outside the curated
// path). Used to populate the Practice tab's topic/section filter and to pass an EXACT match to
// GET /catalog?section=... (see dsa-service's catalogRepo.list - section is a fixed picklist, not
// free text, so no debounce/partial-match handling is needed for it).
export const CATALOG_SECTIONS = [
  "Math & Number Theory",
  "Strings",
  "Arrays",
  "Searching & Binary Search",
  "Sorting",
  "Two Pointers",
  "Sliding Window",
  "Prefix Sum",
  "Hashing",
  "Stack & Queue",
  "Linked List",
  "Recursion & Backtracking",
  "Trees & Binary Search Trees",
  "Heap & Priority Queue",
  "Greedy",
  "Dynamic Programming",
  "Graphs",
  "Bit Manipulation",
] as const;

export type CatalogSection = (typeof CATALOG_SECTIONS)[number];
