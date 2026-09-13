// Admin-only review surface for interview-simulator-service's recorded interview sessions —
// GET /admin/interview-sessions (paginated list) and GET /admin/interview-sessions/{id} (full
// per-session detail: answers, scoring, topic breakdown, presigned recording playback URLs).
// Types mirror the AdminSession* schemas in openapi.yaml exactly.
import {
  ADMIN_INTERVIEW_SESSIONS,
  ADMIN_INTERVIEW_SESSION_BY_ID,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";

export type AdminSessionStatus = "in_progress" | "completed" | "abandoned";
export type VideoStatus = "pending" | "recording" | "processing" | "ready" | "failed";
export type SessionQuestionType =
  | "mcq"
  | "descriptive"
  | "coding"
  | "frontend"
  | "system_design";
export type QuestionSource = "mock_question" | "dsa_catalog";

export interface AdminSessionCandidate {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminSessionSummary {
  id: string;
  candidate: AdminSessionCandidate;
  interview: {
    id: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
  };
  status: AdminSessionStatus;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  videoStatus: VideoStatus;
  hasCameraRecording: boolean;
  hasScreenRecording: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  scorePercent: number;
}

export interface AdminSessionPage {
  sessions: AdminSessionSummary[];
  totalLength: number;
}

export interface AdminSessionQuestionReview {
  id: string;
  ordinal: number;
  type: SessionQuestionType;
  questionSource: QuestionSource;
  questionRefId: string;
  // Exact shape depends on type/questionSource — snapshotted at assignment time. For mcq this
  // includes correctAnswer/explanation, so a reviewer can see what was picked vs. what was right.
  question: Record<string, unknown>;
  status: "pending" | "answered" | "skipped";
  answer: Record<string, unknown> | null;
  score: number | null;
  isCorrect: boolean;
}

export interface AdminSessionDetail {
  id: string;
  status: AdminSessionStatus;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  candidate: AdminSessionCandidate;
  interview: {
    id: string;
    title: string;
    difficulty: string;
    durationMinutes: number;
  };
  scoring: {
    totalQuestions: number;
    answeredQuestions: number;
    skippedQuestions: number;
    correctQuestions: number;
    scorePercent: number;
    topicBreakdown: Record<string, { correct: number; total: number }>;
  };
  recording: {
    videoStatus: VideoStatus;
    videoUrl: string | null;
    screenVideoUrl: string | null;
    streams: {
      kind: "camera" | "screen";
      chunks: number;
      durationSeconds: number;
    }[];
  };
  questions: AdminSessionQuestionReview[];
}

export interface FetchAdminInterviewSessionsParams {
  search?: string;
  status?: AdminSessionStatus;
  pageNumber: number;
}

export const fetchAdminInterviewSessions = async ({
  search,
  status,
  pageNumber,
}: FetchAdminInterviewSessionsParams): Promise<AdminSessionPage> => {
  const params = new URLSearchParams();
  if (search) params.append("searchString", search);
  if (status) params.append("status", status);
  if (pageNumber) params.append("pageNumber", String(pageNumber));

  const queryString = params.toString();
  const url = queryString
    ? `${ADMIN_INTERVIEW_SESSIONS}?${queryString}`
    : ADMIN_INTERVIEW_SESSIONS;

  const response = await AxiosInstance.get(url);
  return response.data;
};

export const fetchAdminInterviewSessionDetail = async (
  id: string
): Promise<AdminSessionDetail> => {
  const response = await AxiosInstance.get(ADMIN_INTERVIEW_SESSION_BY_ID(id));
  return response.data;
};
