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
