export type CompanyProblem = {
  id: string;
  company: string;
  title: string;
  link: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  solved: boolean;
  lastSolved?: string;
  notes?: string;
};

export type BehavioralQuestion = {
  id: string;
  question: string;
  category: string;
  response?: string;
  tips?: string[];
};

export type MockInterview = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  topics: string[];
  rating: number;
  questions?: string[];
};

// Company-specific interview questions
export const companyProblems: CompanyProblem[] = [
  {
    id: "cp1",
    company: "google",
    title: "Two Sum",
    link: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    solved: true,
    lastSolved: "2023-05-10",
  },
  {
    id: "cp2",
    company: "google",
    title: "LRU Cache",
    link: "https://leetcode.com/problems/lru-cache/",
    difficulty: "Medium",
    tags: ["Design", "Hash Table", "Linked List"],
    solved: true,
    lastSolved: "2023-05-15",
  },
  {
    id: "cp3",
    company: "google",
    title: "Median of Two Sorted Arrays",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    solved: false,
  },
  {
    id: "cp4",
    company: "amazon",
    title: "Number of Islands",
    link: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "Medium",
    tags: ["DFS", "BFS", "Union Find", "Matrix"],
    solved: true,
    lastSolved: "2023-06-02",
  },
  {
    id: "cp5",
    company: "amazon",
    title: "Trapping Rain Water",
    link: "https://leetcode.com/problems/trapping-rain-water/",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    solved: false,
  },
  {
    id: "cp6",
    company: "microsoft",
    title: "Reverse Linked List",
    link: "https://leetcode.com/problems/reverse-linked-list/",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    solved: true,
    lastSolved: "2023-04-28",
  },
  {
    id: "cp7",
    company: "meta",
    title: "Valid Parentheses",
    link: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    solved: true,
    lastSolved: "2023-06-10",
  },
  {
    id: "cp8",
    company: "netflix",
    title: "Binary Tree Level Order Traversal",
    link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    difficulty: "Medium",
    tags: ["Tree", "BFS", "Binary Tree"],
    solved: false,
  },
];

// Behavioral interview questions
export const behavioralQuestions: BehavioralQuestion[] = [
  {
    id: "bq1",
    question:
      "Tell me about a time you faced a significant technical challenge. How did you overcome it?",
    category: "Problem-solving",
    response:
      "When leading our e-commerce project, we faced a critical performance issue with page load times exceeding 5 seconds. I organized a dedicated sprint to identify bottlenecks using Chrome DevTools and found multiple issues including unoptimized images and excessive API calls. I implemented lazy loading, image compression, API request batching, and added Redis caching. This reduced load time to under 2 seconds, increasing conversion rates by 15%.",
    tips: [
      "Focus on your specific contributions to solving the problem",
      "Quantify the results where possible",
      "Explain your thinking process and decision-making",
    ],
  },
  {
    id: "bq2",
    question:
      "Describe a situation where you had to work with a difficult team member.",
    category: "Teamwork",
    tips: [
      "Focus on the resolution, not the conflict",
      "Demonstrate empathy and understanding",
      "Explain what you learned from the experience",
    ],
  },
  {
    id: "bq3",
    question:
      "Tell me about a time when you had to make a decision with incomplete information.",
    category: "Decision-making",
    tips: [
      "Explain your thought process and how you assessed risks",
      "Describe how you gathered what information was available",
      "Share the outcome and what you learned",
    ],
  },
  {
    id: "bq4",
    question: "Describe a project where you had to meet a tight deadline.",
    category: "Time management",
    tips: [
      "Focus on how you prioritized tasks",
      "Explain any trade-offs you had to make",
      "Highlight your planning and communication skills",
    ],
  },
  {
    id: "bq5",
    question:
      "Give an example of a time you received critical feedback and how you responded to it.",
    category: "Growth mindset",
    tips: [
      "Show that you're open to feedback",
      "Explain how you implemented changes based on the feedback",
      "Demonstrate self-awareness and a growth mindset",
    ],
  },
];

// Mock interviews
export const mockInterviews: MockInterview[] = [
  {
    id: "mi1",
    title: "Google SDE Interview",
    description:
      "Algorithm focused technical interview with system design elements",
    difficulty: "Hard",
    duration: 60,
    topics: ["Arrays", "Graph", "System Design", "Behavioral"],
    rating: 4,
  },
  {
    id: "mi2",
    title: "Amazon Coding Round",
    description:
      "Focus on data structures and algorithms commonly asked at Amazon",
    difficulty: "Medium",
    duration: 45,
    topics: ["Trees", "Dynamic Programming", "OOP Design"],
    rating: 5,
  },
  {
    id: "mi3",
    title: "Behavioral Interview",
    description:
      "Practice answering common behavioral questions using the STAR method",
    difficulty: "Easy",
    duration: 30,
    topics: ["Leadership", "Problem Solving", "Teamwork"],
    rating: 3,
  },
  {
    id: "mi4",
    title: "Frontend Developer",
    description: "Focus on JavaScript, UI frameworks and web fundamentals",
    difficulty: "Medium",
    duration: 45,
    topics: ["JavaScript", "React", "CSS", "Web Performance"],
    rating: 4,
  },
  {
    id: "mi5",
    title: "System Design Interview",
    description: "Design scalable systems like those at top tech companies",
    difficulty: "Hard",
    duration: 60,
    topics: ["Databases", "API Design", "Microservices", "Scalability"],
    rating: 5,
  },
  {
    id: "mi6",
    title: "Full Stack Interview",
    description: "End-to-end development from frontend to database",
    difficulty: "Medium",
    duration: 60,
    topics: ["Frontend", "Backend", "Database", "API"],
    rating: 4,
  },
];
