// Content-authoring type only — used by the admin mock-interview question form and its service.
// The candidate-facing question/answer flow lives entirely in interviewSession.service.tsx now
// (interview-sessions), which defines its own richer SessionQuestionType instead of this one.
export type QuestionType = "mcq" | "descriptive" | "coding" | "frontend";
