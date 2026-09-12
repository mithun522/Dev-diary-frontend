// Live (recorded) interview session flow — interview-simulator-service's `interview-sessions`
// resource. Starting a session snapshots the mock interview's questions in order, and each
// question is graded as it's answered (no batch submit like interview-attempts has):
//   - mcq / descriptive / frontend / system_design / a coding question with no live catalog match
//     -> PUT .../answer  { answer: string }   (mcq graded by exact match, everything else just
//        needs a non-empty string — there's no LLM/human review wired up on the backend yet)
//   - coding backed by the shared dsa catalog (questionSource: "dsa_catalog")
//     -> PUT .../run     { sourceCode }  (sample tests only, nothing persisted — like DSA's "Run")
//     -> PUT .../submit  { sourceCode }  (full judge, persists score: 100 | 0)
// There is no session-level score/topicScores from the backend (`end` just flips status/videoStatus)
// — the client computes an aggregate from each question's own `score`.
import {
  INTERVIEW_SESSIONS,
  INTERVIEW_SESSION_BY_ID,
  INTERVIEW_SESSION_END,
  INTERVIEW_SESSION_QUESTION_RUN,
  INTERVIEW_SESSION_QUESTION_SUBMIT,
  INTERVIEW_SESSION_QUESTION_ANSWER,
  INTERVIEW_SESSION_VIDEO,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type { JudgeResult } from "../../data/catalogData";

export type SessionQuestionType =
  | "mcq"
  | "descriptive"
  | "coding"
  | "frontend"
  | "system_design";
export type QuestionSource = "mock_question" | "dsa_catalog";
export type SessionQuestionStatus = "pending" | "answered" | "skipped";

// mock_question-sourced snapshot: the mock interview's own question row, flattened.
export interface MockQuestionSnapshot {
  question: string;
  difficulty: string;
  topics: string[];
  timeLimit?: number;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  expectedPoints?: string[];
  maxWords?: number;
  instructions?: string;
  requirements?: string[];
  boilerplate?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

// dsa_catalog-sourced snapshot: shaped like dsa-service's CatalogProblemDetail.
export interface DsaCatalogSnapshot {
  id: string;
  title: string;
  difficulty: string;
  topics: string[];
  description: string;
  functionName: string;
  paramNames: string[];
  starterCode: string;
  sampleTestCases: {
    id: string;
    args: unknown[];
    expected: unknown;
    isSample: boolean;
  }[];
}

export interface InterviewSessionQuestion {
  id: string;
  ordinal: number;
  type: SessionQuestionType;
  questionSource: QuestionSource;
  questionRefId: string;
  question: MockQuestionSnapshot | DsaCatalogSnapshot;
  status: SessionQuestionStatus;
  answer: { text?: string; submissionId?: string; status?: string } | null;
  score: number | null;
}

export type VideoStatus =
  | "pending"
  | "recording"
  | "processing"
  | "ready"
  | "failed";

export interface InterviewSession {
  id: string;
  mockInterviewId: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  endedAt?: string;
  videoStatus: VideoStatus;
  questions: InterviewSessionQuestion[];
}

// Presigned GET URLs for the stitched camera/screen recordings — null until videoStatus is
// "ready". Backed by a fire-and-forget Lambda invoke on session end (video-finalizer), not a
// tracked job queue, so there's no push notification when it finishes — the caller must poll.
export interface SessionVideoPlayback {
  videoStatus: VideoStatus;
  videoUrl: string | null;
  screenVideoUrl: string | null;
}

// Only a coding question backed by the live dsa catalog gets the code-editor + run/submit UI —
// everything else (including a coding question that fell back to the mock interview's own
// embedded content) is answered as plain text via `answer`.
export const isCodingCatalogQuestion = (q: InterviewSessionQuestion) =>
  q.type === "coding" && q.questionSource === "dsa_catalog";

export const startInterviewSession = async (
  mockInterviewId: string
): Promise<InterviewSession> => {
  const response = await AxiosInstance.post(INTERVIEW_SESSIONS, {
    mockInterviewId,
  });
  return response.data;
};

export const getInterviewSession = async (
  id: string
): Promise<InterviewSession> => {
  const response = await AxiosInstance.get(INTERVIEW_SESSION_BY_ID(id));
  return response.data;
};

export const runSessionCodingQuestion = async (
  sessionId: string,
  questionId: string,
  sourceCode: string
): Promise<JudgeResult> => {
  const response = await AxiosInstance.put(
    INTERVIEW_SESSION_QUESTION_RUN(sessionId, questionId),
    { sourceCode }
  );
  return response.data;
};

export const submitSessionCodingQuestion = async (
  sessionId: string,
  questionId: string,
  sourceCode: string
): Promise<InterviewSessionQuestion> => {
  const response = await AxiosInstance.put(
    INTERVIEW_SESSION_QUESTION_SUBMIT(sessionId, questionId),
    { sourceCode }
  );
  return response.data;
};

export const answerSessionQuestion = async (
  sessionId: string,
  questionId: string,
  answer: string
): Promise<InterviewSessionQuestion> => {
  const response = await AxiosInstance.put(
    INTERVIEW_SESSION_QUESTION_ANSWER(sessionId, questionId),
    { answer }
  );
  return response.data;
};

export const endInterviewSession = async (
  id: string
): Promise<InterviewSession> => {
  const response = await AxiosInstance.put(INTERVIEW_SESSION_END(id));
  return response.data;
};

export const getSessionVideoPlayback = async (
  id: string
): Promise<SessionVideoPlayback> => {
  const response = await AxiosInstance.get(INTERVIEW_SESSION_VIDEO(id));
  return response.data;
};
