// Live (recorded) interview session flow — interview-simulator-service's `interview-sessions`
// resource. Starting a session snapshots the mock interview's questions in order, and each
// question is graded as it's answered (no batch submit like interview-attempts has):
//   - mcq / descriptive / frontend / system_design / a coding question with no live catalog match
//     -> PUT .../answer  { answer: string }   (mcq graded by exact match, everything else just
//        needs a non-empty string — there's no LLM/human review wired up on the backend yet)
//   - coding backed by the shared dsa catalog (questionSource: "dsa_catalog")
//     -> PUT .../run     { sourceCode, language }  (sample tests only, nothing persisted — like
//        DSA's "Run")
//     -> PUT .../submit  { sourceCode, language }  (full judge, persists score: 100 | 0)
//     interview-simulator-service's SessionQuestionSourceCode schema now requires `language`
//     (enum: javascript/typescript/python/java/c/cpp, same as dsa-service's LanguageCode) and
//     forwards it through to dsa-service. The stored answer also returns `language` alongside
//     `submissionId`/`status`. `DsaCatalogSnapshot.starterCode` below is the per-language object
//     (dsa-service's shape, passed through verbatim by interview-simulator-service's
//     session-question snapshot) — no `returnType` field, dsa-service resolves that server-side
//     from the catalog problem's own stored metadata.
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
  INTERVIEW_SESSION_STRIKES,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type { JudgeResult, StarterCodeByLanguage } from "../../data/catalogData";
import type { CodeExecutionLanguage } from "../../constants/Languages";

// Malpractice strike count (tab-switch/window-hide detections during a live session) — real,
// implemented backend-side (interview_sessions.strike_count, updateSessionStrikes route).
//
//   PUT /interview-sessions/{id}/strikes
//     body: { count: number }   — the new ABSOLUTE total, not a delta/increment. The client always
//       knows its own current count and just syncs it, so a retried call after a network hiccup
//       can't double-count the way "increment by 1" would. 400s if the session has already ended.
//     -> 200 { id: string, strikeCount: number }
//     Same auth/ownership as every other session route (Bearer JWT, session must belong to caller).
//
//   `GET /interview-sessions/{id}` (InterviewSession) also returns `strikeCount: number`.
//
// IMPORTANT CAVEAT this does NOT solve on its own: reloading the page today always starts a
// brand-new session (LiveInterviewPage always calls startInterviewSession on mount) — nothing
// currently resumes an existing in-progress session. Persisting the count to the old session is
// real and useful (e.g. for the admin review page), but it won't outlive a reload in the candidate's
// own UI until session-resume is built too — and resuming safely also means continuing video-chunk
// numbering from where it left off (see recordingUpload.service.tsx), not just re-reading this
// field. Flagged rather than silently implied as "fixed."
export interface SessionStrikesResponse {
  id: string;
  strikeCount: number;
}

export const updateSessionStrikeCount = async (
  sessionId: string,
  count: number
): Promise<SessionStrikesResponse> => {
  const response = await AxiosInstance.put(INTERVIEW_SESSION_STRIKES(sessionId), {
    count,
  });
  return response.data;
};

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
  // Coding fallback's starter code, keyed by language — same per-language shape as
  // DsaCatalogSnapshot.starterCode below (dsa-service's multi-language contract), not a plain
  // string.
  boilerplate?: StarterCodeByLanguage;
  solutionLanguage?: CodeExecutionLanguage;
  testCases?: { input: string; expectedOutput: string }[];
}

// dsa_catalog-sourced snapshot: shaped like dsa-service's CatalogProblemDetail — passed through
// verbatim by interview-simulator-service, so starterCode is the same per-language object.
export interface DsaCatalogSnapshot {
  id: string;
  title: string;
  difficulty: string;
  topics: string[];
  description: string;
  functionName: string;
  paramNames: string[];
  starterCode: StarterCodeByLanguage;
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
  answer: {
    text?: string;
    submissionId?: string;
    status?: string;
    language?: CodeExecutionLanguage;
  } | null;
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
  strikeCount?: number;
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

// Returns every session belonging to the caller, across all mock interviews, newest first — but
// each with `questions: []` (the list endpoint doesn't join questions; use getInterviewSession for
// the full detail of one). Used to find a resumable in-progress session before starting a new one.
export const listInterviewSessions = async (): Promise<InterviewSession[]> => {
  const response = await AxiosInstance.get(INTERVIEW_SESSIONS);
  return response.data;
};

export const runSessionCodingQuestion = async (
  sessionId: string,
  questionId: string,
  sourceCode: string,
  language: CodeExecutionLanguage
): Promise<JudgeResult> => {
  const response = await AxiosInstance.put(
    INTERVIEW_SESSION_QUESTION_RUN(sessionId, questionId),
    { sourceCode, language }
  );
  return response.data;
};

export const submitSessionCodingQuestion = async (
  sessionId: string,
  questionId: string,
  sourceCode: string,
  language: CodeExecutionLanguage
): Promise<InterviewSessionQuestion> => {
  const response = await AxiosInstance.put(
    INTERVIEW_SESSION_QUESTION_SUBMIT(sessionId, questionId),
    { sourceCode, language }
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
