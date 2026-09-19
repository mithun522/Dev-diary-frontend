// Each of the 8 backend services is its own independent API Gateway deployment (see
// dev-diary-backend/DEPLOYMENT.md) — there is no shared host, so each gets its own base URL here,
// overridable via VITE_* env vars per environment. Defaults point at the live "dev" stage.

export const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL ??
  "https://cwhp9kueog.execute-api.ap-south-1.amazonaws.com/dev";
export const USER_API_URL =
  import.meta.env.VITE_USER_API_URL ??
  "https://euoyz087cg.execute-api.ap-south-1.amazonaws.com/dev";
export const DSA_API_URL =
  import.meta.env.VITE_DSA_API_URL ??
  "https://zofzbhrqcf.execute-api.ap-south-1.amazonaws.com/dev";
export const TECH_INTERVIEW_API_URL =
  import.meta.env.VITE_TECH_INTERVIEW_API_URL ??
  "https://a0xsdf98mb.execute-api.ap-south-1.amazonaws.com/dev";
export const KNOWLEDGE_API_URL =
  import.meta.env.VITE_KNOWLEDGE_API_URL ??
  "https://rdeq4rwl5b.execute-api.ap-south-1.amazonaws.com/dev";
export const INTERVIEW_SIMULATOR_API_URL =
  import.meta.env.VITE_INTERVIEW_SIMULATOR_API_URL ??
  "https://4f7jttzak9.execute-api.ap-south-1.amazonaws.com/dev";
export const SYSTEM_DESIGN_API_URL =
  import.meta.env.VITE_SYSTEM_DESIGN_API_URL ??
  "https://7wzdcv9zug.execute-api.ap-south-1.amazonaws.com/dev";
export const ANALYTICS_API_URL =
  import.meta.env.VITE_ANALYTICS_API_URL ??
  "https://ip97o2az6c.execute-api.ap-south-1.amazonaws.com/dev";
export const QUESTION_BANK_API_URL =
  import.meta.env.VITE_QUESTION_BANK_API_URL ??
  "https://d1lenhdl7k.execute-api.ap-south-1.amazonaws.com/dev";
// code-execution-service (https://0i56doitt8.execute-api.ap-south-1.amazonaws.com/dev) is
// internal-only, deliberately not wired here — it needs hidden test cases the browser must never
// see, so it is only ever called server-to-server by dsa-service. Judge a submission via
// CATALOG_SUBMISSIONS below, never by calling that service directly.

// ---- auth-service ----
export const REGISTER = `${AUTH_API_URL}/register`;
export const LOGIN = `${AUTH_API_URL}/login`;
export const SEND_OTP = `${AUTH_API_URL}/auth/otp`;
export const VERIFY_OTP = `${AUTH_API_URL}/auth/verifyotp`;
export const RESET_PASSWORD = `${AUTH_API_URL}/auth/reset-password`;
// Super-admin -> admin (with a fixed seat_limit) -> student invite hierarchy. Every invite/accept
// endpoint's auth is checked inside auth-service's Lambda, not by API Gateway.
export const INVITE_ADMIN = `${AUTH_API_URL}/admin/invites`;
export const INVITE_STUDENTS = `${AUTH_API_URL}/admin/students/invites`;
export const ACCEPT_INVITE = `${AUTH_API_URL}/invites/accept`;
// Lists/resends only ever touch invites the caller themselves sent — same endpoints serve both
// a super admin managing admin invites and an admin managing student invites.
export const LIST_INVITES = `${AUTH_API_URL}/invites`;
export const RESEND_INVITE = (id: string) => `${AUTH_API_URL}/invites/${id}/resend`;
export const REVOKE_INVITE = (id: string) => `${AUTH_API_URL}/invites/${id}`;
export const ADMIN_SEAT_USAGE = `${AUTH_API_URL}/admin/seats`;
export const SUPER_ADMIN_ADMINS = `${AUTH_API_URL}/super-admin/admins`;
export const SUPER_ADMIN_ADMIN_SEAT_LIMIT = (id: string) =>
  `${SUPER_ADMIN_ADMINS}/${id}/seat-limit`;

// ---- user-service ----
export const SINGLE_USER = `${USER_API_URL}/user`;
// Admin-only: manage every user's role (list + promote/demote). Backed by requireAdmin.
export const ADMIN_USERS = `${USER_API_URL}/admin/users`;
export const ADMIN_USER_ROLE = (id: string) => `${ADMIN_USERS}/${id}/role`;

// ---- dsa-service ----
export const DSA = `${DSA_API_URL}/dsa`;
export const DSA_BY_USER = `${DSA}/user`;
export const DSA_BY_PROGRESS = `${DSA}/progress/user`;
export const LANGUAGE = `${DSA_API_URL}/language`;
export const LANGUAGE_BY_ID = (id: string) => `${LANGUAGE}/${id}`;
export const DSA_TODOS = `${DSA_API_URL}/dsa/todos`;
export const DSA_TODOS_BY_USER = `${DSA_TODOS}/user`;
// Shared catalog of solvable problems (distinct from a user's own DSA_BY_USER log) — browse,
// view detail (with sample test cases only), submit a solution, list past submissions.
export const CATALOG = `${DSA_API_URL}/catalog`;
export const CATALOG_BY_ID = (id: string) => `${CATALOG}/${id}`;
export const CATALOG_SUBMISSIONS = (id: string) => `${CATALOG}/${id}/submissions`;
// Judges only the sample test cases and does not persist a submission row — used for "Run".
export const CATALOG_RUN = (id: string) => `${CATALOG}/${id}/run`;
// Admin-only: regenerate a catalog problem's test cases.
export const CATALOG_GENERATE_TEST_CASES = (id: string) =>
  `${CATALOG}/${id}/generate-test-cases`;

// ---- dsa-service: curriculum (topic-based beginner exercises, separate from the catalog
// above — one row per topic/problem/language, fractional `position` for O(1) insert-between) ----
export const CURRICULUM_TOPICS = `${DSA_API_URL}/curriculum/topics`;
export const CURRICULUM_TOPIC_BY_ID = (id: string) => `${CURRICULUM_TOPICS}/${id}`;
export const CURRICULUM_TOPIC_PROBLEMS = (topicId: string) =>
  `${CURRICULUM_TOPIC_BY_ID(topicId)}/problems`;
export const CURRICULUM_PROBLEMS = `${DSA_API_URL}/curriculum/problems`;
export const CURRICULUM_PROBLEM_BY_ID = (id: string) => `${CURRICULUM_PROBLEMS}/${id}`;
export const CURRICULUM_PROBLEM_TEST_CASES = (id: string) =>
  `${CURRICULUM_PROBLEM_BY_ID(id)}/test-cases`;
export const CURRICULUM_PROBLEM_RUN = (id: string) => `${CURRICULUM_PROBLEM_BY_ID(id)}/run`;
export const CURRICULUM_PROBLEM_SUBMISSIONS = (id: string) =>
  `${CURRICULUM_PROBLEM_BY_ID(id)}/submissions`;

// ---- tech-interview-service ----
export const TECHNICAL_INTERVIEW = `${TECH_INTERVIEW_API_URL}/techinterview`;
// Shared, curated Q&A catalog (tech_interview.catalog_languages/topics/questions) — read-only,
// seeded from markdown via tech-interview-service's scripts/seedCatalog.js. Distinct from
// TECHNICAL_INTERVIEW above, which is each candidate's own personal Q&A bank.
export const TECH_INTERVIEW_CATALOG_LANGUAGES = `${TECHNICAL_INTERVIEW}/catalog/languages`;
export const TECH_INTERVIEW_CATALOG_LANGUAGE_BY_ID = (language: string) =>
  `${TECH_INTERVIEW_CATALOG_LANGUAGES}/${language}`;
export const TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG = (slug: string) =>
  `${TECHNICAL_INTERVIEW}/catalog/questions/${slug}`;
export const TECH_INTERVIEW_CATALOG_SEARCH = `${TECHNICAL_INTERVIEW}/catalog/search`;

// ---- knowledge-service ----
export const BLOGS = `${KNOWLEDGE_API_URL}/blogs`;
export const GET_BLOGS_BY_USER = `${BLOGS}/user`;
export const GET_PUBLISHED_BLOGS = `${BLOGS}/published`;
export const GET_DRAFTED_BLOGS = `${BLOGS}/draft`;
export const PUBLISH_BLOG = `${BLOGS}`; // PUT `${PUBLISH_BLOG}/:id/publish`
export const BLOG_COVER_IMAGE_UPLOAD_URL = `${BLOGS}/cover-image-upload-url`;
export const NOTES = `${KNOWLEDGE_API_URL}/notes`;
// Admin-only: delete any user's blog regardless of ownership (moderation). Listing reuses BLOGS
// itself — GET /blogs already returns every user's blogs, not just the caller's.
export const ADMIN_BLOG_DELETE = (id: string) => `${KNOWLEDGE_API_URL}/admin/blogs/${id}`;

// ---- interview-simulator-service ----
export const MOCK_INTERVIEWS = `${INTERVIEW_SIMULATOR_API_URL}/mock-interviews`;
export const MOCK_INTERVIEW_BY_ID = (id: string) => `${MOCK_INTERVIEWS}/${id}`;
export const MOCK_INTERVIEW_QUESTIONS = (interviewId: string) =>
  `${MOCK_INTERVIEWS}/${interviewId}/questions`;
export const MOCK_INTERVIEW_QUESTION_BY_ID = (interviewId: string, questionId: string) =>
  `${MOCK_INTERVIEWS}/${interviewId}/questions/${questionId}`;
// Live (recorded) interview sessions — the voice+camera+screen-recorded interview flow, and the
// only one this app uses (the earlier interview-attempts resource — no recording, batch-graded —
// was retired in favor of this single flow). A session snapshots its question list at creation,
// and grades per-question as the candidate goes (mcq exact-match / non-empty-text for everything
// else via `answer`; `run`+`submit` for coding questions backed by the shared dsa catalog). There
// is no session-level aggregate score from the backend — the client sums each question's `score`.
export const INTERVIEW_SESSIONS = `${INTERVIEW_SIMULATOR_API_URL}/interview-sessions`;
export const INTERVIEW_SESSION_BY_ID = (id: string) => `${INTERVIEW_SESSIONS}/${id}`;
export const INTERVIEW_SESSION_END = (id: string) =>
  `${INTERVIEW_SESSION_BY_ID(id)}/end`;
// Malpractice strike count, synced from the client — see the header comment in
// interviewSession.service.tsx for the full contract.
export const INTERVIEW_SESSION_STRIKES = (id: string) =>
  `${INTERVIEW_SESSION_BY_ID(id)}/strikes`;
// Presigned GET URLs for the stitched camera/screen recordings, once the backend's video-finalizer
// Lambda (fired when a session ends) has concatenated the uploaded chunks. videoUrl/screenVideoUrl
// stay null until videoStatus is "ready" — poll this after /end.
export const INTERVIEW_SESSION_VIDEO = (id: string) =>
  `${INTERVIEW_SESSION_BY_ID(id)}/video`;
export const INTERVIEW_SESSION_QUESTION_RUN = (
  sessionId: string,
  questionId: string
) => `${INTERVIEW_SESSION_BY_ID(sessionId)}/questions/${questionId}/run`;
export const INTERVIEW_SESSION_QUESTION_SUBMIT = (
  sessionId: string,
  questionId: string
) => `${INTERVIEW_SESSION_BY_ID(sessionId)}/questions/${questionId}/submit`;
export const INTERVIEW_SESSION_QUESTION_ANSWER = (
  sessionId: string,
  questionId: string
) => `${INTERVIEW_SESSION_BY_ID(sessionId)}/questions/${questionId}/answer`;
// Recorded video, per session — camera and screen are independent chunk streams (`kind`), each
// numbered from 0 (`chunkIndex`). Presigned-S3-PUT: request an upload URL, PUT bytes to S3
// directly, then confirm the chunk's metadata.
export const INTERVIEW_SESSION_VIDEO_CHUNKS = (sessionId: string) =>
  `${INTERVIEW_SESSION_BY_ID(sessionId)}/video-chunks`;
export const INTERVIEW_SESSION_VIDEO_CHUNKS_UPLOAD_URL = (sessionId: string) =>
  `${INTERVIEW_SESSION_VIDEO_CHUNKS(sessionId)}/upload-url`;
// Admin-only review surface: every candidate's interview sessions (paginated/filterable list),
// and a full per-session detail (answers, scoring, topic breakdown, recording playback).
export const ADMIN_INTERVIEW_SESSIONS = `${INTERVIEW_SIMULATOR_API_URL}/admin/interview-sessions`;
export const ADMIN_INTERVIEW_SESSION_BY_ID = (id: string) =>
  `${ADMIN_INTERVIEW_SESSIONS}/${id}`;

export const COMPANY_PROBLEMS = `${INTERVIEW_SIMULATOR_API_URL}/company-problems`;
export const COMPANY_PROBLEM_BY_ID = (id: string) => `${COMPANY_PROBLEMS}/${id}`;
export const BEHAVIORAL_QUESTIONS = `${INTERVIEW_SIMULATOR_API_URL}/behavioral-questions`;
export const BEHAVIORAL_QUESTION_BY_ID = (id: string) => `${BEHAVIORAL_QUESTIONS}/${id}`;

// ---- system-design-service ----
export const SYSTEM_DESIGN_CASES = `${SYSTEM_DESIGN_API_URL}/system-design/cases`;
export const SYSTEM_DESIGN_CASE_BY_ID = (id: string) => `${SYSTEM_DESIGN_CASES}/${id}`;
export const SCALABILITY_PATTERNS = `${SYSTEM_DESIGN_API_URL}/system-design/patterns`;
export const SCALABILITY_PATTERN_BY_ID = (id: string) => `${SCALABILITY_PATTERNS}/${id}`;
export const SYSTEM_METRICS = `${SYSTEM_DESIGN_API_URL}/system-design/metrics`;

// ---- analytics-service ----
export const ANALYTICS_SUMMARY = `${ANALYTICS_API_URL}/analytics/summary`;
export const ANALYTICS_ACTIVITY = `${ANALYTICS_API_URL}/analytics/activity`;
export const ANALYTICS_SKILLS = `${ANALYTICS_API_URL}/analytics/skills`;
export const ANALYTICS_PRACTICE_LOG = `${ANALYTICS_API_URL}/analytics/practice-log`;

// ---- question-bank-service ----
export const QUESTION_BANK = `${QUESTION_BANK_API_URL}/materials`;
export const QUESTION_BANK_BY_USER = `${QUESTION_BANK}/user`;
// POST { fileName, contentType } -> { uploadUrl, fileKey } (same presigned-upload pattern as
// BLOG_COVER_IMAGE_UPLOAD_URL — the frontend PUTs the file straight to S3, then POSTs metadata
// to QUESTION_BANK to create the record).
export const QUESTION_BANK_UPLOAD_URL = `${QUESTION_BANK}/upload-url`;
// Admin-only: list/delete every user's materials regardless of ownership (moderation).
export const ADMIN_MATERIALS = `${QUESTION_BANK_API_URL}/admin/materials`;
export const ADMIN_MATERIAL_DELETE = (id: string) => `${ADMIN_MATERIALS}/${id}`;
