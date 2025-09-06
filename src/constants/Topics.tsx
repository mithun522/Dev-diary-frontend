export const Topics = {
  ARRAY: "ARRAY",
  STRING: "STRING",
  LINKED_LIST: "LINKED_LIST",
  STACK: "STACK",
  QUEUE: "QUEUE",
  TREE: "TREE",
  GRAPH: "GRAPH",
  SLIDING_WINDOW: "SLIDING_WINDOW",
  DYNAMIC_PROGRAMMING: "DYNAMIC_PROGRAMMING",
  BIT_MANIPULATION: "BIT_MANIPULATION",
  BACKTRACKING: "BACKTRACKING",
  GREEDY: "GREEDY",
  HEAP: "HEAP",
  SORTING: "SORTING",
  TWO_POINTERS: "TWO_POINTERS",
  BINARY_SEARCH: "BINARY_SEARCH",
  DFS: "DFS",
  BFS: "BFS",
  HASHING: "HASHING",
  SWAPPING: "SWAPPING",
  MERGE_SORT: "MERGE_SORT",
  QUICK_SORT: "QUICK_SORT",
  HEAP_SORT: "HEAP_SORT",
  INSERTION_SORT: "INSERTION_SORT",
  BUBBLE_SORT: "BUBBLE_SORT",
} as const;

export const TopicColors: Record<Topic, string> = {
  [Topics.ARRAY]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [Topics.STRING]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [Topics.LINKED_LIST]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [Topics.STACK]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [Topics.QUEUE]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  [Topics.TREE]:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  [Topics.GRAPH]:
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  [Topics.SLIDING_WINDOW]:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  [Topics.DYNAMIC_PROGRAMMING]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [Topics.BIT_MANIPULATION]:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  [Topics.BACKTRACKING]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.GREEDY]:
    "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  [Topics.HEAP]:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  [Topics.SORTING]:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200",
  [Topics.TWO_POINTERS]:
    "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  [Topics.BINARY_SEARCH]:
    "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  [Topics.DFS]: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  [Topics.BFS]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.HASHING]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.SWAPPING]:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  [Topics.MERGE_SORT]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.QUICK_SORT]:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  [Topics.HEAP_SORT]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.INSERTION_SORT]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  [Topics.BUBBLE_SORT]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
} as const;

export type Topic = (typeof Topics)[keyof typeof Topics];
