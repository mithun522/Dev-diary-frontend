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

// ---- auth-service ----
export const REGISTER = `${AUTH_API_URL}/register`;
export const LOGIN = `${AUTH_API_URL}/login`;
export const SEND_OTP = `${AUTH_API_URL}/auth/otp`;
export const VERIFY_OTP = `${AUTH_API_URL}/auth/verifyotp`;
export const RESET_PASSWORD = `${AUTH_API_URL}/auth/reset-password`;

// ---- user-service ----
export const SINGLE_USER = `${USER_API_URL}/user`;

// ---- dsa-service ----
export const DSA = `${DSA_API_URL}/dsa`;
export const DSA_BY_USER = `${DSA}/user`;
export const DSA_BY_PROGRESS = `${DSA}/progress/user`;
export const LANGUAGE = `${DSA_API_URL}/language`;

// ---- tech-interview-service ----
export const TECHNICAL_INTERVIEW = `${TECH_INTERVIEW_API_URL}/techinterview`;

// ---- knowledge-service ----
export const BLOGS = `${KNOWLEDGE_API_URL}/blogs`;
export const GET_BLOGS_BY_USER = `${BLOGS}/user`;
export const GET_PUBLISHED_BLOGS = `${BLOGS}/published`;
export const GET_DRAFTED_BLOGS = `${BLOGS}/draft`;
export const PUBLISH_BLOG = `${BLOGS}`; // PUT `${PUBLISH_BLOG}/:id/publish`
export const BLOG_COVER_IMAGE_UPLOAD_URL = `${BLOGS}/cover-image-upload-url`;
export const NOTES = `${KNOWLEDGE_API_URL}/notes`;

// ---- interview-simulator-service ----
export const MOCK_INTERVIEWS = `${INTERVIEW_SIMULATOR_API_URL}/mock-interviews`;
export const INTERVIEW_ATTEMPTS = `${INTERVIEW_SIMULATOR_API_URL}/interview-attempts`;
export const COMPANY_PROBLEMS = `${INTERVIEW_SIMULATOR_API_URL}/company-problems`;
export const BEHAVIORAL_QUESTIONS = `${INTERVIEW_SIMULATOR_API_URL}/behavioral-questions`;

// ---- system-design-service ----
export const SYSTEM_DESIGN_CASES = `${SYSTEM_DESIGN_API_URL}/system-design/cases`;
export const SCALABILITY_PATTERNS = `${SYSTEM_DESIGN_API_URL}/system-design/patterns`;
export const SYSTEM_METRICS = `${SYSTEM_DESIGN_API_URL}/system-design/metrics`;

// ---- analytics-service ----
export const ANALYTICS_SUMMARY = `${ANALYTICS_API_URL}/analytics/summary`;
export const ANALYTICS_ACTIVITY = `${ANALYTICS_API_URL}/analytics/activity`;
export const ANALYTICS_SKILLS = `${ANALYTICS_API_URL}/analytics/skills`;
export const ANALYTICS_PRACTICE_LOG = `${ANALYTICS_API_URL}/analytics/practice-log`;
