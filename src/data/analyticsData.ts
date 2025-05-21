export type SkillCategory =
  | "all"
  | "algorithms"
  | "data-structures"
  | "system-design"
  | "languages";

export type ActivityEntry = {
  day: number;
  name: string;
  dsa: number;
  system: number;
  interview: number;
  total: number;
};

export type SkillEntry = {
  name: string;
  category: SkillCategory;
  proficiency: number;
  recommendedPractice: string;
};

export type PracticeLogEntry = {
  id: string;
  date: string;
  activity: string;
  category: string;
  timeSpent: number; // in hours
};

// Activity data for charts
export const analyticsData: ActivityEntry[] = [
  { day: 1, name: "Mon", dsa: 3, system: 1, interview: 0, total: 4 },
  { day: 2, name: "Tue", dsa: 2, system: 2, interview: 1, total: 5 },
  { day: 3, name: "Wed", dsa: 0, system: 2, interview: 3, total: 5 },
  { day: 4, name: "Thu", dsa: 4, system: 0, interview: 1, total: 5 },
  { day: 5, name: "Fri", dsa: 2, system: 3, interview: 0, total: 5 },
  { day: 6, name: "Sat", dsa: 5, system: 2, interview: 1, total: 8 },
  { day: 7, name: "Sun", dsa: 3, system: 1, interview: 2, total: 6 },
  { day: 8, name: "Mon", dsa: 1, system: 2, interview: 1, total: 4 },
  { day: 9, name: "Tue", dsa: 3, system: 1, interview: 0, total: 4 },
  { day: 10, name: "Wed", dsa: 2, system: 3, interview: 2, total: 7 },
  { day: 11, name: "Thu", dsa: 5, system: 1, interview: 0, total: 6 },
  { day: 12, name: "Fri", dsa: 4, system: 2, interview: 1, total: 7 },
  { day: 13, name: "Sat", dsa: 3, system: 4, interview: 2, total: 9 },
  { day: 14, name: "Sun", dsa: 2, system: 1, interview: 3, total: 6 },
];

// Skills proficiency data
export const skillsData: SkillEntry[] = [
  {
    name: "Arrays",
    category: "data-structures",
    proficiency: 85,
    recommendedPractice: "Multi-dimensional arrays",
  },
  {
    name: "Strings",
    category: "data-structures",
    proficiency: 78,
    recommendedPractice: "Pattern matching algorithms",
  },
  {
    name: "Linked Lists",
    category: "data-structures",
    proficiency: 90,
    recommendedPractice: "Advanced operations",
  },
  {
    name: "Trees",
    category: "data-structures",
    proficiency: 65,
    recommendedPractice: "Red-black trees",
  },
  {
    name: "Graphs",
    category: "data-structures",
    proficiency: 45,
    recommendedPractice: "Graph traversals (DFS/BFS)",
  },
  {
    name: "Hash Tables",
    category: "data-structures",
    proficiency: 75,
    recommendedPractice: "Collision resolution strategies",
  },
  {
    name: "Heaps",
    category: "data-structures",
    proficiency: 60,
    recommendedPractice: "Heap operations and applications",
  },
  {
    name: "Stacks/Queues",
    category: "data-structures",
    proficiency: 95,
    recommendedPractice: "Advanced use cases",
  },

  {
    name: "Binary Search",
    category: "algorithms",
    proficiency: 80,
    recommendedPractice: "Variants and edge cases",
  },
  {
    name: "Two Pointers",
    category: "algorithms",
    proficiency: 85,
    recommendedPractice: "Complex applications",
  },
  {
    name: "Sliding Window",
    category: "algorithms",
    proficiency: 70,
    recommendedPractice: "Variable size windows",
  },
  {
    name: "Dynamic Programming",
    category: "algorithms",
    proficiency: 55,
    recommendedPractice: "State optimization techniques",
  },
  {
    name: "Greedy",
    category: "algorithms",
    proficiency: 75,
    recommendedPractice: "Proof of correctness",
  },
  {
    name: "Backtracking",
    category: "algorithms",
    proficiency: 50,
    recommendedPractice: "Pruning techniques",
  },
  {
    name: "Recursion",
    category: "algorithms",
    proficiency: 80,
    recommendedPractice: "Tail recursion optimization",
  },
  {
    name: "Bit Manipulation",
    category: "algorithms",
    proficiency: 40,
    recommendedPractice: "Common bit operations",
  },

  {
    name: "Scalability",
    category: "system-design",
    proficiency: 65,
    recommendedPractice: "Horizontal vs. Vertical scaling",
  },
  {
    name: "Microservices",
    category: "system-design",
    proficiency: 60,
    recommendedPractice: "Service mesh patterns",
  },
  {
    name: "Databases",
    category: "system-design",
    proficiency: 75,
    recommendedPractice: "NoSQL data modeling",
  },
  {
    name: "Load Balancing",
    category: "system-design",
    proficiency: 80,
    recommendedPractice: "Advanced strategies",
  },
  {
    name: "Caching",
    category: "system-design",
    proficiency: 70,
    recommendedPractice: "Cache invalidation patterns",
  },
  {
    name: "API Design",
    category: "system-design",
    proficiency: 85,
    recommendedPractice: "GraphQL vs REST tradeoffs",
  },
  {
    name: "Sharding",
    category: "system-design",
    proficiency: 55,
    recommendedPractice: "Consistent hashing",
  },
  {
    name: "Message Queues",
    category: "system-design",
    proficiency: 60,
    recommendedPractice: "Kafka architecture",
  },

  {
    name: "JavaScript",
    category: "languages",
    proficiency: 90,
    recommendedPractice: "Advanced closures and prototypes",
  },
  {
    name: "Python",
    category: "languages",
    proficiency: 85,
    recommendedPractice: "Metaclasses and descriptors",
  },
  {
    name: "Java",
    category: "languages",
    proficiency: 65,
    recommendedPractice: "Concurrency patterns",
  },
  {
    name: "C++",
    category: "languages",
    proficiency: 50,
    recommendedPractice: "Move semantics and RAII",
  },
  {
    name: "Go",
    category: "languages",
    proficiency: 40,
    recommendedPractice: "Concurrency with goroutines",
  },
  {
    name: "TypeScript",
    category: "languages",
    proficiency: 80,
    recommendedPractice: "Advanced type manipulation",
  },
  {
    name: "SQL",
    category: "languages",
    proficiency: 75,
    recommendedPractice: "Complex joins and indexing",
  },
  {
    name: "Rust",
    category: "languages",
    proficiency: 25,
    recommendedPractice: "Ownership and borrowing",
  },
];

// Practice activity log
export const practiceLog: PracticeLogEntry[] = [
  {
    id: "pl1",
    date: "2023-05-20",
    activity: "Solved Array and String problems",
    category: "DSA",
    timeSpent: 2.5,
  },
  {
    id: "pl2",
    date: "2023-05-19",
    activity: "Designed Instagram system architecture",
    category: "System Design",
    timeSpent: 1.5,
  },
  {
    id: "pl3",
    date: "2023-05-19",
    activity: "Mock interview with peer",
    category: "Interview",
    timeSpent: 1,
  },
  {
    id: "pl4",
    date: "2023-05-18",
    activity: "Graph algorithms practice",
    category: "DSA",
    timeSpent: 2,
  },
  {
    id: "pl5",
    date: "2023-05-17",
    activity: "Caching strategies research",
    category: "System Design",
    timeSpent: 1,
  },
  {
    id: "pl6",
    date: "2023-05-16",
    activity: "Dynamic programming problems",
    category: "DSA",
    timeSpent: 3,
  },
  {
    id: "pl7",
    date: "2023-05-16",
    activity: "React component optimization",
    category: "Frontend",
    timeSpent: 1.5,
  },
  {
    id: "pl8",
    date: "2023-05-15",
    activity: "Database indexing techniques",
    category: "Backend",
    timeSpent: 2,
  },
  {
    id: "pl9",
    date: "2023-05-14",
    activity: "Behavioral question preparation",
    category: "Interview",
    timeSpent: 1,
  },
  {
    id: "pl10",
    date: "2023-05-13",
    activity: "Tree traversal algorithms",
    category: "DSA",
    timeSpent: 2.5,
  },
];
