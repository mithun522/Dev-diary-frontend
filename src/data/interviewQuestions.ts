export type QuestionType = "mcq" | "descriptive" | "coding" | "frontend";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  timeLimit?: number; // in minutes
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface DescriptiveQuestion extends BaseQuestion {
  type: "descriptive";
  expectedPoints?: string[];
  maxWords?: number;
}

export interface CodingQuestion extends BaseQuestion {
  type: "coding";
  boilerplate?: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  solution?: string;
}

export interface FrontendQuestion extends BaseQuestion {
  type: "frontend";
  instructions: string;
  requirements: string[];
  boilerplate?: {
    html?: string;
    css?: string;
    js?: string;
  };
}

export type Question =
  | MCQQuestion
  | DescriptiveQuestion
  | CodingQuestion
  | FrontendQuestion;

export interface InterviewSession {
  id: string;
  interviewId: string;
  title: string;
  startTime: number;
  duration: number; // in minutes
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  status: "not_started" | "in_progress" | "completed" | "submitted";
  timeRemaining: number; // in seconds
  score?: number;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export interface InterviewAttempt {
  id: string;
  interviewId: string;
  interviewTitle: string;
  startTime: number;
  endTime?: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  status: "completed" | "in_progress";
  topicScores: Record<string, { correct: number; total: number }>;
}

// Enhanced mock interview data with actual questions
export const interviewQuestions: Record<string, Question[]> = {
  mi1: [
    // Google SDE Interview
    {
      id: "q1",
      type: "mcq",
      question:
        "What is the time complexity of finding an element in a balanced binary search tree?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: 1,
      difficulty: "Medium",
      topics: ["Data Structures", "Binary Search Tree"],
      explanation:
        "In a balanced BST, the height is log n, so searching takes O(log n) time.",
    },
    {
      id: "q2",
      type: "coding",
      question:
        "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
      difficulty: "Easy",
      topics: ["Arrays", "Hash Map"],
      boilerplate: `function twoSum(nums, target) {
    // Your code here
    
}`,
      testCases: [
        { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
        { input: "[3,2,4], 6", expectedOutput: "[1,2]" },
      ],
    },
    {
      id: "q3",
      type: "descriptive",
      question:
        "Design a URL shortener service like bit.ly. Explain your approach including database design, API endpoints, and scaling considerations.",
      difficulty: "Hard",
      topics: ["System Design", "Databases", "Scalability"],
      expectedPoints: [
        "Database schema for URL mapping",
        "Base62 encoding for short URLs",
        "Caching strategy",
        "Load balancing",
        "Rate limiting",
      ],
      maxWords: 500,
    },
  ],
  mi2: [
    // Amazon Coding Round
    {
      id: "q4",
      type: "mcq",
      question:
        "Which data structure is best suited for implementing a LRU cache?",
      options: [
        "Array",
        "Linked List",
        "Hash Map + Doubly Linked List",
        "Binary Tree",
      ],
      correctAnswer: 2,
      difficulty: "Medium",
      topics: ["Data Structures", "Caching"],
      explanation:
        "Hash Map provides O(1) access while Doubly Linked List maintains order for LRU operations.",
    },
    {
      id: "q5",
      type: "coding",
      question: "Given a binary tree, find its maximum depth.",
      difficulty: "Easy",
      topics: ["Binary Tree", "Recursion"],
      boilerplate: `function maxDepth(root) {
    // Your code here
    
}`,
      testCases: [
        { input: "[3,9,20,null,null,15,7]", expectedOutput: "3" },
        { input: "[1,null,2]", expectedOutput: "2" },
      ],
    },
  ],
  mi4: [
    // Frontend Developer
    {
      id: "q6",
      type: "mcq",
      question: "What is the purpose of the 'key' prop in React lists?",
      options: [
        "To style list items",
        "To help React identify which items have changed",
        "To sort the list",
        "To filter list items",
      ],
      correctAnswer: 1,
      difficulty: "Easy",
      topics: ["React", "Virtual DOM"],
      explanation:
        "Keys help React identify which items have changed, are added, or are removed for efficient re-rendering.",
    },
    {
      id: "q7",
      type: "frontend",
      question: "Create a responsive card component with hover effects",
      instructions:
        "Build a card component that displays user information with a hover animation. The card should be responsive and include a profile image, name, and description.",
      requirements: [
        "Responsive design that works on mobile and desktop",
        "Smooth hover animation (scale or shadow effect)",
        "Profile image with rounded corners",
        "Clean typography and spacing",
      ],
      difficulty: "Medium",
      topics: ["CSS", "Responsive Design", "Animations"],
      boilerplate: {
        html: `<div class="card">
  <img src="https://via.placeholder.com/150" alt="Profile" class="profile-img">
  <h3 class="name">John Doe</h3>
  <p class="description">Frontend Developer</p>
</div>`,
        css: `/* Add your CSS here */
.card {
  
}`,
        js: `// Add any JavaScript interactions here if needed`,
      },
    },
  ],
};
