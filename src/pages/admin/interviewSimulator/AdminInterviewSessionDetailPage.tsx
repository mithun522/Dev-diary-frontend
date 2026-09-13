import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Button from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { useFetchAdminInterviewSessionDetail } from "../../../api/hooks/useAdminInterviewSessions";
import type { AdminSessionQuestionReview } from "../../../api/services/adminInterviewSessions.service";
import { formatDate } from "../../../utils/formatDate";
import ErrorPage from "../../ErrorPage";

const getQuestionText = (q: AdminSessionQuestionReview): string => {
  const snapshot = q.question;
  if (typeof snapshot.title === "string") return snapshot.title; // dsa_catalog snapshot
  if (typeof snapshot.question === "string") return snapshot.question; // mock_question snapshot
  return "Untitled question";
};

const getQuestionTopics = (q: AdminSessionQuestionReview): string[] => {
  const topics = q.question.topics;
  return Array.isArray(topics) ? (topics as string[]) : [];
};

const getQuestionDifficulty = (q: AdminSessionQuestionReview): string => {
  const difficulty = q.question.difficulty;
  return typeof difficulty === "string" ? difficulty : "";
};

const getMcqOptions = (q: AdminSessionQuestionReview): string[] | null => {
  const options = q.question.options;
  return Array.isArray(options) ? (options as string[]) : null;
};

const getMcqCorrectAnswer = (q: AdminSessionQuestionReview): number | null => {
  const correctAnswer = q.question.correctAnswer;
  return typeof correctAnswer === "number" ? correctAnswer : null;
};

const getAnswerSummary = (q: AdminSessionQuestionReview): string => {
  const answer = q.answer;
  if (!answer) return "No answer submitted";
  if (typeof answer.text === "string") return answer.text;
  if (typeof answer.submissionId === "string") {
    const runtime = typeof answer.runtimeMs === "number" ? ` (${answer.runtimeMs}ms)` : "";
    return `Code submission — ${answer.status ?? "unknown"}${runtime}`;
  }
  return JSON.stringify(answer);
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "hard":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  }
};

const candidateLabel = (
  candidate: { email: string | null; firstName: string | null; lastName: string | null }
) => {
  const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ");
  return name || candidate.email || "Unknown candidate";
};

const AdminInterviewSessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading, error } = useFetchAdminInterviewSessionDetail(id);

  if (error) return <ErrorPage message="Failed to fetch this interview session" />;

  if (isLoading || !session) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  const { recording } = session;

  return (
    <div className="space-y-6" data-cy="admin-interview-session-detail-page">
      <Button
        variant="outlinePrimary"
        size="sm"
        onClick={() => navigate("/admin/interview-sessions")}
        className="flex items-center gap-1"
        data-cy="admin-interview-session-back"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sessions
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Candidate + interview + scoring summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{candidateLabel(session.candidate)}</CardTitle>
            <CardDescription>{session.candidate.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interview</span>
              <span className="font-medium">{session.interview.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{session.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Started</span>
              <span>{formatDate(session.startedAt)}</span>
            </div>
            {session.endedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ended</span>
                <span>{formatDate(session.endedAt)}</span>
              </div>
            )}
            {session.durationMinutes != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{session.durationMinutes} min</span>
              </div>
            )}

            <div className="border-t pt-3 space-y-3">
              <div className="text-center">
                <div className="text-4xl font-bold">{session.scoring.scorePercent}%</div>
                <div className="text-muted-foreground">
                  {session.scoring.correctQuestions} of {session.scoring.totalQuestions} correct
                  {session.scoring.skippedQuestions > 0 &&
                    ` · ${session.scoring.skippedQuestions} skipped`}
                </div>
              </div>

              {Object.entries(session.scoring.topicBreakdown).map(
                ([topic, { correct, total }]) => (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{topic}</span>
                      <span className="text-muted-foreground">
                        {correct}/{total}
                      </span>
                    </div>
                    <Progress value={total ? (correct / total) * 100 : 0} />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recording */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recording</CardTitle>
            <CardDescription>
              {recording.streams.length > 0
                ? recording.streams
                    .map((s) => `${s.kind}: ${s.chunks} chunks, ${s.durationSeconds}s`)
                    .join(" · ")
                : "No recording was captured for this session."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recording.videoStatus === "pending" ||
            recording.videoStatus === "recording" ||
            recording.videoStatus === "processing" ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording is being processed — this page will update automatically.
              </div>
            ) : recording.videoStatus === "failed" ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Recording processing failed.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recording.videoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Camera</p>
                    <video
                      controls
                      className="w-full rounded-md border"
                      src={recording.videoUrl}
                      data-cy="admin-session-camera-playback"
                    />
                  </div>
                )}
                {recording.screenVideoUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Screen</p>
                    <video
                      controls
                      className="w-full rounded-md border"
                      src={recording.screenVideoUrl}
                      data-cy="admin-session-screen-playback"
                    />
                  </div>
                )}
                {!recording.videoUrl && !recording.screenVideoUrl && (
                  <p className="text-sm text-muted-foreground">
                    No recording is available for this session.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-question review */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Questions</h2>
        {session.questions.map((q) => {
          const mcqOptions = getMcqOptions(q);
          const mcqCorrectAnswer = getMcqCorrectAnswer(q);
          const pickedIndex = q.type === "mcq" && typeof q.answer?.text === "string"
            ? Number(q.answer.text)
            : null;

          return (
            <Card key={q.id} data-cy="admin-session-question-row">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base">
                    {q.ordinal}. {getQuestionText(q)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(getQuestionDifficulty(q))}>
                      {getQuestionDifficulty(q) || q.type}
                    </Badge>
                    {q.status === "answered" && (
                      <Badge
                        className={
                          q.isCorrect
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {q.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    )}
                    {q.status !== "answered" && <Badge variant="outline">{q.status}</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getQuestionTopics(q).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {mcqOptions ? (
                  <div className="space-y-1 text-sm">
                    {mcqOptions.map((option, idx) => (
                      <div
                        key={idx}
                        className={`rounded-md border px-3 py-2 flex items-center justify-between ${
                          idx === mcqCorrectAnswer
                            ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                            : idx === pickedIndex
                            ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                            : ""
                        }`}
                      >
                        <span>{option}</span>
                        <span className="flex gap-1">
                          {idx === pickedIndex && (
                            <Badge variant="outline" className="text-xs">
                              Candidate's answer
                            </Badge>
                          )}
                          {idx === mcqCorrectAnswer && (
                            <Badge variant="outline" className="text-xs">
                              Correct answer
                            </Badge>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Answer</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {getAnswerSummary(q)}
                    </p>
                  </div>
                )}
                {q.score != null && (
                  <p className="text-xs text-muted-foreground">Score: {q.score}/100</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInterviewSessionDetailPage;
