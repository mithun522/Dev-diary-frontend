// User-facing wiring for the live, voice-driven interview loop: start an attempt, fetch the
// question set to ask, then submit the whole batch of answers at once for grading + completion.
// Thin AxiosInstance wrappers, one per endpoint, mirroring adminInterviewSimulator.service.tsx's
// convention.
//
// There is no per-answer submit route (no /answers path exists in the service's openapi.yaml) —
// PUT /interview-attempts/{id} (operationId submitInterviewAttempt) grades every answer and
// completes the attempt in a single call, so the voice loop must accumulate answers client-side
// across all questions before calling it once at the end.
//
// The backend spreads type-specific fields onto the question object itself (mcq: options/
// correctAnswer/explanation, descriptive: expectedPoints/maxWords, etc.) rather than nesting them
// under a `data` object, so `InterviewQuestion` below is its own type distinct from the admin
// service's `MockInterviewQuestion` (which models the admin CRUD input/output shape instead).
import {
  MOCK_INTERVIEW_QUESTIONS,
  INTERVIEW_ATTEMPTS,
  INTERVIEW_ATTEMPT_BY_ID,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type { QuestionType } from "../../data/interviewQuestions";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface InterviewQuestion {
  id: string;
  type: QuestionType;
  question: string;
  difficulty: Difficulty;
  topics: string[];
  timeLimit?: number;
  // mcq
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  // descriptive
  expectedPoints?: string[];
  maxWords?: number;
  // coding
  boilerplate?: string;
  testCases?: { input: string; expectedOutput: string }[];
  solution?: string;
  // frontend
  instructions?: string;
  requirements?: string[];
}

export type InterviewAttemptStatus = "in_progress" | "completed";

export interface InterviewAttempt {
  id: string;
  interviewId: string;
  interviewTitle: string;
  startTime: string;
  endTime?: string;
  totalQuestions: number;
  status: InterviewAttemptStatus;
  score?: number;
  correctAnswers?: number;
  topicScores?: Record<string, { correct: number; total: number }>;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface FinishInterviewResult {
  id: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  topicScores: Record<string, { correct: number; total: number }>;
  status: "completed";
}

export const startInterviewAttempt = async (
  interviewId: string
): Promise<InterviewAttempt> => {
  const response = await AxiosInstance.post(INTERVIEW_ATTEMPTS, {
    interviewId,
  });
  return response.data;
};

export const fetchLiveInterviewQuestions = async (
  interviewId: string
): Promise<InterviewQuestion[]> => {
  const response = await AxiosInstance.get(
    MOCK_INTERVIEW_QUESTIONS(interviewId)
  );
  return response.data;
};

export const submitInterviewAttempt = async (
  attemptId: string,
  answers: AnswerSubmission[]
): Promise<FinishInterviewResult> => {
  const response = await AxiosInstance.put(
    INTERVIEW_ATTEMPT_BY_ID(attemptId),
    { answers }
  );
  return response.data;
};

export const fetchInterviewAttempts = async (): Promise<
  InterviewAttempt[]
> => {
  const response = await AxiosInstance.get(INTERVIEW_ATTEMPTS);
  return response.data;
};

export const fetchInterviewAttemptById = async (
  id: string
): Promise<InterviewAttempt> => {
  const response = await AxiosInstance.get(INTERVIEW_ATTEMPT_BY_ID(id));
  return response.data;
};
