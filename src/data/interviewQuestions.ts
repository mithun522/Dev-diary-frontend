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
