// Types
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "Solved" | "Attempted" | "Unsolved";

export type DSAProblem = {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  tags: string[];
  link: string;
  status: ProblemStatus;
  lastSolved?: string; // ISO date string
  notes?: string;
  solution?: string; // Markdown solution
};

// Dummy data
export const dsaProblems: DSAProblem[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    link: "https://leetcode.com/problems/two-sum/",
    status: "Solved",
    lastSolved: "2023-09-15T10:30:00Z",
    notes:
      "Use a hash map to store values and their indices as you iterate through the array.",
    solution: `\`\`\`javascript
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null;
}
\`\`\``,
  },
  {
    id: "2",
    title: "Add Two Numbers",
    difficulty: "Medium",
    tags: ["Linked List", "Math"],
    link: "https://leetcode.com/problems/add-two-numbers/",
    status: "Solved",
    lastSolved: "2023-08-22T14:20:00Z",
    notes:
      "Remember to handle the carry correctly and watch out for lists of different lengths.",
  },
  {
    id: "3",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    status: "Attempted",
    lastSolved: "2023-09-10T08:15:00Z",
  },
  {
    id: "4",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Arrays", "Binary Search", "Divide and Conquer"],
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    status: "Unsolved",
  },
  {
    id: "5",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    link: "https://leetcode.com/problems/valid-parentheses/",
    status: "Solved",
    lastSolved: "2023-09-05T16:40:00Z",
    solution: `\`\`\`python
def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    
    return not stack
\`\`\``,
  },
  {
    id: "6",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    link: "https://leetcode.com/problems/merge-two-sorted-lists/",
    status: "Solved",
    lastSolved: "2023-08-18T11:10:00Z",
  },
  {
    id: "7",
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Arrays", "Divide and Conquer", "Dynamic Programming"],
    link: "https://leetcode.com/problems/maximum-subarray/",
    status: "Solved",
    lastSolved: "2023-07-30T09:25:00Z",
  },
  {
    id: "8",
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["Tree", "BFS"],
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    status: "Unsolved",
  },
  {
    id: "9",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Arrays", "Dynamic Programming"],
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    status: "Solved",
    lastSolved: "2023-09-01T13:15:00Z",
  },
  {
    id: "10",
    title: "LRU Cache",
    difficulty: "Medium",
    tags: ["Design", "Hash Table", "Linked List"],
    link: "https://leetcode.com/problems/lru-cache/",
    status: "Attempted",
    lastSolved: "2023-08-28T10:30:00Z",
  },
  {
    id: "11",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Arrays", "Sorting"],
    link: "https://leetcode.com/problems/merge-intervals/",
    status: "Solved",
    lastSolved: "2023-09-08T15:45:00Z",
  },
  {
    id: "12",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Arrays", "Two Pointers", "Stack", "Dynamic Programming"],
    link: "https://leetcode.com/problems/trapping-rain-water/",
    status: "Unsolved",
  },
];

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
