import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  MicOff,
  Video,
  ScreenShare,
  Download,
  Play,
} from "lucide-react";
import Button from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";
import {
  startInterviewSession,
  getInterviewSession,
  listInterviewSessions,
  endInterviewSession,
  runSessionCodingQuestion,
  submitSessionCodingQuestion,
  answerSessionQuestion,
  getSessionVideoPlayback,
  updateSessionStrikeCount,
  isCodingCatalogQuestion,
  type InterviewSession,
  type InterviewSessionQuestion,
  type MockQuestionSnapshot,
  type DsaCatalogSnapshot,
  type SessionVideoPlayback,
} from "../../api/services/interviewSession.service";
import type { JudgeResult } from "../../data/catalogData";
import { formatTestCaseArgs } from "../../utils/formatTestCaseArgs";
import CodeEditor from "../dsa/practice/CodeEditor";
import TestResultsPanel from "../dsa/practice/TestResultsPanel";
import {
  useSpeechRecognition,
  isSpeechRecognitionSupported,
} from "../../hooks/useSpeechRecognition";
import { useInterviewRecording } from "../../hooks/useInterviewRecording";

// interview-sessions grades per-question as the candidate goes (no batch submit like
// interview-attempts has, and no session-level aggregate score — that's computed client-side from
// each question's own `score`). Camera + screen recording span "permission-setup" -> "answering"
// -> "ending" and stop the moment the candidate finishes the last question. Navigation between
// questions is free (Previous/Next/jump-from-modal) — answering a question no longer forces the
// candidate forward; finishing only happens via the explicit "Submit Interview" action.
type Phase = "permission-setup" | "loading" | "answering" | "ending" | "results";

const getMockSnapshot = (q: InterviewSessionQuestion) =>
  q.question as MockQuestionSnapshot;
const getCatalogSnapshot = (q: InterviewSessionQuestion) =>
  q.question as DsaCatalogSnapshot;

const getPromptTitle = (q: InterviewSessionQuestion) =>
  isCodingCatalogQuestion(q) ? getCatalogSnapshot(q).title : getMockSnapshot(q).question;

const getTopics = (q: InterviewSessionQuestion): string[] =>
  (isCodingCatalogQuestion(q) ? getCatalogSnapshot(q).topics : getMockSnapshot(q).topics) ?? [];

const getDifficulty = (q: InterviewSessionQuestion): string =>
  (isCodingCatalogQuestion(q) ? getCatalogSnapshot(q).difficulty : getMockSnapshot(q).difficulty) ??
  "";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
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

// Starter/default value for a question's answer draft the first time it's visited — a coding
// question gets its boilerplate/starter code, a text-answered question gets whatever was already
// saved (e.g. the candidate navigated back to it after answering), or "" for a fresh question.
const initialDraftFor = (q: InterviewSessionQuestion): string => {
  if (q.type === "coding") {
    return isCodingCatalogQuestion(q)
      ? getCatalogSnapshot(q).starterCode ?? ""
      : getMockSnapshot(q).boilerplate ?? "";
  }
  const savedText = q.answer?.text;
  return typeof savedText === "string" ? savedText : "";
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const LiveInterviewPage = () => {
  const { interviewId: mockInterviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const {
    isListening,
    finalTranscript,
    interimTranscript,
    error: micError,
    start: startListening,
    stop: stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition();
  const {
    cameraStream,
    isRecording,
    permissionError,
    uploadDegraded,
    requestPermissions,
    startRecording,
    stopAndFinalize,
    downloadLocalRecording,
    hasLocalRecording,
  } = useInterviewRecording();

  const [phase, setPhase] = useState<Phase>("permission-setup");
  const [requestingPermissions, setRequestingPermissions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewSessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Per-question drafts (text answer or source code, keyed by question id) so navigating away
  // and back with Previous/Next never loses what the candidate typed or already saved.
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [runResult, setRunResult] = useState<JudgeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [videoPlayback, setVideoPlayback] = useState<SessionVideoPlayback | null>(
    null
  );
  // Malpractice tracking: leaving the tab/window during the interview counts as a strike. Two
  // strikes just warn; a third auto-submits whatever's been answered so far. This can only ever
  // catch tab switches / minimizing (the Page Visibility API) — an actual browser/tab close can be
  // deterred with a native confirm prompt, but once the tab is gone no JS runs to count it.
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState<string | null>(null);

  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const setupStarted = useRef(false);
  const handledTabSwitchCount = useRef(0);
  const speechSupported = isSpeechRecognitionSupported();
  const currentQuestion = questions[currentIndex] ?? null;
  const currentDraft = currentQuestion ? answerDrafts[currentQuestion.id] ?? "" : "";

  useEffect(() => {
    if (cameraPreviewRef.current) {
      cameraPreviewRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    if (!micError) return;
    toast.error(micError);
  }, [micError]);

  // Release the camera/screen streams if the candidate navigates away mid-interview.
  useEffect(() => {
    return () => {
      stopAndFinalize();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed a draft for the current question the first time it's visited (never overwrites one
  // already in the map, so re-visiting via Previous/Next preserves whatever's there).
  useEffect(() => {
    if (!currentQuestion) return;
    resetTranscript();
    setRunResult(null);
    setAnswerDrafts((prev) =>
      prev[currentQuestion.id] !== undefined
        ? prev
        : { ...prev, [currentQuestion.id]: initialDraftFor(currentQuestion) }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  // The backend stitches the recorded chunks asynchronously (a fire-and-forget Lambda invoke, no
  // push notification) — poll for playback URLs once the interview is over, until the video is
  // ready or the backend gives up.
  useEffect(() => {
    if (phase !== "results" || !session) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await getSessionVideoPlayback(session.id);
        if (cancelled) return;
        setVideoPlayback(result);
        if (result.videoStatus === "ready" || result.videoStatus === "failed") {
          return;
        }
      } catch {
        // Keep retrying — a transient failure here shouldn't give up on the poll.
      }
      if (!cancelled) {
        timeoutId = setTimeout(poll, 5000);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [phase, session]);

  // Live dictation overwrites the current question's draft as it's recognized. Guarded on a
  // non-empty transcript so a freshly-seeded draft (e.g. a previously saved answer) isn't
  // clobbered by the reset-to-"" that happens when a new question mounts.
  useEffect(() => {
    if (!currentQuestion || !finalTranscript) return;
    setAnswerDrafts((prev) => ({ ...prev, [currentQuestion.id]: finalTranscript }));
  }, [finalTranscript, currentQuestion]);

  const handleEnableRecording = async () => {
    setRequestingPermissions(true);
    const granted = await requestPermissions();
    setRequestingPermissions(false);
    if (granted) setPhase("loading");
  };

  useEffect(() => {
    if (!mockInterviewId || phase !== "loading" || setupStarted.current) return;
    setupStarted.current = true;

    (async () => {
      try {
        // Resume an existing in-progress session for this interview rather than always starting
        // a new one — otherwise a reload (or just navigating back to this URL) would silently
        // abandon whatever was already answered. There's no "abandon" action yet (see
        // endInterviewSession — only ending completes a session), so any in-progress session for
        // this interview is assumed to be "the one the candidate is still working on."
        const existingSessions = await listInterviewSessions().catch(() => []);
        const resumable = existingSessions.find(
          (s) => s.mockInterviewId === mockInterviewId && s.status === "in_progress"
        );

        const activeSession = resumable
          ? await getInterviewSession(resumable.id)
          : await startInterviewSession(mockInterviewId);

        if (activeSession.questions.length === 0) {
          setLoadError("This interview has no questions yet.");
          return;
        }

        setSession(activeSession);
        setQuestions(activeSession.questions);
        // Land on the first unanswered question rather than always index 0 — a no-op for a fresh
        // session (nothing's answered yet either way), but skips straight past what's already done
        // when resuming.
        const firstUnanswered = activeSession.questions.findIndex(
          (q) => q.status !== "answered"
        );
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);

        const initialStrikes = activeSession.strikeCount ?? 0;
        handledTabSwitchCount.current = initialStrikes;
        setTabSwitchCount(initialStrikes);

        if (resumable) {
          toast.info("Resuming your in-progress interview.");
        }
        // `resume: true` continues chunk numbering from wherever the previous recording left off
        // (see useInterviewRecording) instead of restarting at 0 and overwriting it. The candidate
        // will be re-prompted for camera/screen permissions regardless — a reload always tears
        // down the previous MediaStream, and browsers never let a page silently resume screen
        // capture across a reload for security reasons — so the stitched recording will have a
        // jump-cut across the reload gap, not a corrupted or truncated one.
        startRecording(activeSession.id, Boolean(resumable));
        setPhase("answering");
      } catch (err) {
        setLoadError(
          errorMessage(err, "Couldn't start the interview. Please try again.")
        );
      }
    })();
  }, [mockInterviewId, phase, startRecording]);

  const finishSession = useCallback(
    async (currentSession: InterviewSession) => {
      setPhase("ending");
      setEndError(null);
      // Awaited on purpose: this resolves only once the final recording chunks have been uploaded
      // and confirmed. Ending the session queues the backend stitching job, so kicking that off
      // while the last chunk is still in flight would leave it out of the finished recording.
      await stopAndFinalize();

      try {
        const finalSession = await endInterviewSession(currentSession.id);
        setSession(finalSession);
        setQuestions(finalSession.questions);
        setPhase("results");
      } catch (err) {
        setEndError(errorMessage(err, "Couldn't finish the interview."));
      }
    },
    [stopAndFinalize]
  );

  // Count a strike every time the candidate leaves this tab/window (switches tabs, switches
  // apps, minimizes) while the interview is in progress. Only listens during "answering" — not
  // during setup or after the interview's already finished.
  useEffect(() => {
    if (phase !== "answering") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase]);

  // Best-effort deterrent against closing the tab/browser outright — browsers show their own
  // native "leave site?" prompt (the message text itself can't be customized). If the candidate
  // actually confirms leaving, the page unloads before any of our code can react, so a real close
  // can never be counted as a strike the way a tab switch can.
  useEffect(() => {
    if (phase !== "answering") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [phase]);

  // React to a new strike exactly once per count: the first two just warn, the third auto-submits
  // whatever's been answered so far, bypassing the normal unanswered-questions confirmation since
  // this isn't a candidate-initiated submit.
  useEffect(() => {
    if (phase !== "answering") return;
    if (tabSwitchCount <= handledTabSwitchCount.current) return;
    handledTabSwitchCount.current = tabSwitchCount;

    // Best-effort sync to the session so the count isn't only ever held in this tab's React state
    // (e.g. so an admin reviewing the session later can see it). Swallows errors deliberately — a
    // transient network hiccup here shouldn't block showing the warning/auto-submit locally, which
    // is what actually matters to the candidate in the moment.
    if (session) {
      updateSessionStrikeCount(session.id, tabSwitchCount).catch(() => {});
    }

    if (tabSwitchCount >= 3) {
      setAutoSubmitReason(
        "Your interview was automatically submitted after repeated tab switches (3 strikes)."
      );
      toast.error("Interview auto-submitted — repeated tab switching detected.");
      if (session) finishSession(session);
    } else {
      setShowTabSwitchWarning(true);
    }
  }, [tabSwitchCount, phase, session, finishSession]);

  const applyAnsweredQuestion = useCallback((updated: InterviewSessionQuestion) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      if (isListening) stopListening();
      setCurrentIndex(index);
    },
    [questions.length, isListening, stopListening]
  );

  const handleAnswerSubmit = useCallback(
    async (answerValue: string) => {
      if (!session || !currentQuestion) return;
      if (!answerValue.trim()) {
        toast.error("Give an answer before saving.");
        return;
      }
      if (isListening) stopListening();

      setIsSubmittingAnswer(true);
      try {
        const updated = await answerSessionQuestion(
          session.id,
          currentQuestion.id,
          answerValue.trim()
        );
        applyAnsweredQuestion(updated);
        toast.success("Answer saved");
      } catch (err) {
        toast.error(errorMessage(err, "Couldn't submit that answer."));
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [session, currentQuestion, isListening, stopListening, applyAnsweredQuestion]
  );

  const handleRunCode = async () => {
    if (!session || !currentQuestion) return;
    setIsRunning(true);
    try {
      const result = await runSessionCodingQuestion(
        session.id,
        currentQuestion.id,
        currentDraft
      );
      setRunResult(result);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't run your code."));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!session || !currentQuestion) return;
    setIsSubmittingAnswer(true);
    try {
      const updated = await submitSessionCodingQuestion(
        session.id,
        currentQuestion.id,
        currentDraft
      );
      applyAnsweredQuestion(updated);
      toast.success("Answer saved");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't submit your solution."));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const unansweredQuestions = questions.filter((q) => q.status !== "answered");

  const handleSubmitInterviewClick = () => {
    if (unansweredQuestions.length > 0) {
      setShowUnansweredModal(true);
      return;
    }
    if (session) finishSession(session);
  };

  const handleJumpToUnanswered = (questionId: string) => {
    const index = questions.findIndex((q) => q.id === questionId);
    setShowUnansweredModal(false);
    if (index >= 0) goToQuestion(index);
  };

  const handleSubmitAnyway = () => {
    setShowUnansweredModal(false);
    if (session) finishSession(session);
  };

  if (!mockInterviewId) {
    return null;
  }

  if (!speechSupported) {
    return (
      <div
        className="max-w-xl mx-auto mt-16 text-center space-y-4"
        data-cy="live-interview-unsupported"
      >
        <h1 className="text-2xl font-bold">Use Chrome or Edge</h1>
        <p className="text-muted-foreground">
          The live voice interview uses your browser's built-in speech
          recognition, which currently only works in Chrome and Edge (desktop
          or Android). Please switch browsers to continue, or try the
          text-based mock interview instead.
        </p>
        <Button variant="outlinePrimary" onClick={() => navigate("/interview")}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  const recordingIndicator = isRecording && (
    <div
      className="fixed bottom-4 right-4 z-50 w-40 rounded-lg overflow-hidden border shadow-lg bg-black"
      data-cy="live-interview-recording-indicator"
    >
      <video
        ref={cameraPreviewRef}
        autoPlay
        muted
        playsInline
        className="w-full aspect-video object-cover"
      />
      <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        REC
      </div>
    </div>
  );

  if (phase === "permission-setup") {
    return (
      <div
        className="max-w-xl mx-auto mt-12 space-y-4"
        data-cy="live-interview-permission-setup"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Camera &amp; Screen Recording Required
            </CardTitle>
            <CardDescription>
              This live interview records your camera and shares your screen
              for the full session, so it can be reviewed later. Recording
              starts once you grant both permissions below and stops the
              moment you finish the interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Camera + microphone
            </div>
            <div className="flex items-center gap-2">
              <ScreenShare className="h-4 w-4" /> Screen share (choose a tab,
              window, or your whole screen when prompted)
            </div>
            {permissionError && (
              <p className="text-red-600 dark:text-red-400">{permissionError}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleEnableRecording}
              disabled={requestingPermissions}
              data-cy="live-interview-enable-recording"
            >
              {requestingPermissions && <Loader2 className="h-4 w-4 animate-spin" />}
              Enable Camera &amp; Screen Recording
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="max-w-xl mx-auto mt-16 text-center space-y-4"
        data-cy="live-interview-error"
      >
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">{loadError}</p>
        <Button variant="outlinePrimary" onClick={() => navigate("/interview")}>
          Back to Interviews
        </Button>
      </div>
    );
  }

  if (phase === "loading" || !session || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 mt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your interview...</p>
      </div>
    );
  }

  if (phase === "results") {
    const correctCount = questions.filter((q) => q.score === 100).length;
    const totalQuestions = questions.length;
    const topicScores: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      getTopics(q).forEach((topic) => {
        topicScores[topic] ??= { correct: 0, total: 0 };
        topicScores[topic].total += 1;
        if (q.score === 100) topicScores[topic].correct += 1;
      });
    });

    return (
      <div className="max-w-2xl mx-auto space-y-6" data-cy="live-interview-results">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Interview Complete</h1>
          {autoSubmitReason && (
            <p
              className="text-sm text-red-600 dark:text-red-400"
              data-cy="live-interview-auto-submit-reason"
            >
              {autoSubmitReason}
            </p>
          )}
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold">
              {totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0}
              <span className="text-lg text-muted-foreground">%</span>
            </CardTitle>
            <CardDescription>
              {correctCount} of {totalQuestions} questions correct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold">Topic Breakdown</h3>
            {Object.entries(topicScores).map(([topic, { correct, total }]) => (
              <div key={topic} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{topic}</span>
                  <span className="text-muted-foreground">
                    {correct}/{total}
                  </span>
                </div>
                <Progress value={total ? (correct / total) * 100 : 0} />
              </div>
            ))}

            <div className="border-t pt-3 space-y-2" data-cy="live-interview-recording-playback">
              <h3 className="font-semibold">Recording</h3>
              {!videoPlayback ||
              videoPlayback.videoStatus === "pending" ||
              videoPlayback.videoStatus === "recording" ||
              videoPlayback.videoStatus === "processing" ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing your recording — this can take a minute or two.
                </div>
              ) : videoPlayback.videoStatus === "failed" ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Your recording couldn't be processed.
                </p>
              ) : (
                <div className="space-y-3">
                  {videoPlayback.videoUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Camera</p>
                      <video
                        controls
                        className="w-full rounded-md border"
                        src={videoPlayback.videoUrl}
                        data-cy="live-interview-camera-playback"
                      />
                    </div>
                  )}
                  {videoPlayback.screenVideoUrl && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Screen</p>
                      <video
                        controls
                        className="w-full rounded-md border"
                        src={videoPlayback.screenVideoUrl}
                        data-cy="live-interview-screen-playback"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {uploadDegraded && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your recording couldn't be uploaded to the server, but it's
                  still available in this browser tab:
                </p>
                <div className="flex gap-2">
                  {hasLocalRecording("camera") && (
                    <Button
                      variant="outlinePrimary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => downloadLocalRecording("camera")}
                      data-cy="live-interview-download-camera"
                    >
                      <Download className="h-3 w-3" /> Camera Recording
                    </Button>
                  )}
                  {hasLocalRecording("screen") && (
                    <Button
                      variant="outlinePrimary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => downloadLocalRecording("screen")}
                      data-cy="live-interview-download-screen"
                    >
                      <Download className="h-3 w-3" /> Screen Recording
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate("/interview")}
              data-cy="live-interview-back-to-interviews"
            >
              Back to Interviews
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (phase === "ending") {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        {endError ? (
          <>
            <h1 className="text-2xl font-bold">Couldn't finish the interview</h1>
            <p className="text-muted-foreground">{endError}</p>
            <Button onClick={() => finishSession(session)} data-cy="live-interview-retry-end">
              Retry
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">
              Saving your recording and finishing up...
            </p>
            <p className="text-sm text-muted-foreground">
              Please keep this tab open — closing it now could cut the end off your recording.
            </p>
          </>
        )}
      </div>
    );
  }

  const isMcq = currentQuestion.type === "mcq";
  const isCoding = currentQuestion.type === "coding";
  const isCodingCatalog = isCodingCatalogQuestion(currentQuestion);
  const questionNumber = currentIndex + 1;
  const selectedMcqAnswer =
    isMcq && typeof currentQuestion.answer?.text === "string"
      ? Number(currentQuestion.answer.text)
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-cy="live-interview-page">
      {recordingIndicator}

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => navigate("/interview")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {questions.length}
          </span>
          {tabSwitchCount > 0 && (
            <span
              className="text-xs text-amber-600 dark:text-amber-400"
              data-cy="live-interview-tab-switch-count"
            >
              Tab switches: {tabSwitchCount}/3
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSubmitInterviewClick}
          data-cy="live-interview-submit-interview"
        >
          Submit Interview
        </Button>
      </div>

      <Progress
        value={(questionNumber / questions.length) * 100}
        data-cy="live-interview-progress"
      />

      <div className="flex items-center justify-between">
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-1"
          data-cy="live-interview-previous"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => goToQuestion(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-1"
          data-cy="live-interview-next"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg">{getPromptTitle(currentQuestion)}</CardTitle>
            <Badge className={getDifficultyColor(getDifficulty(currentQuestion))}>
              {getDifficulty(currentQuestion)}
            </Badge>
          </div>
          <CardDescription>
            <div className="flex flex-wrap gap-1 mt-2">
              {getTopics(currentQuestion).map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isMcq && (
            <div className="grid gap-2" data-cy="live-interview-mcq-options">
              {getMockSnapshot(currentQuestion).options?.map((option, idx) => (
                <Button
                  key={idx}
                  variant={idx === selectedMcqAnswer ? "primary" : "outlinePrimary"}
                  className="text-left justify-start"
                  disabled={isSubmittingAnswer}
                  onClick={() => handleAnswerSubmit(String(idx))}
                  data-cy={`live-interview-mcq-option-${idx}`}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {isCoding && isCodingCatalog && (
            <div className="space-y-3">
              <MarkdownPreview
                source={getCatalogSnapshot(currentQuestion).description}
              />
              <div className="space-y-2">
                {getCatalogSnapshot(currentQuestion).sampleTestCases?.map(
                  (testCase, index) => (
                    <div
                      key={testCase.id}
                      className="rounded-md border p-3 text-sm font-mono"
                    >
                      <div>
                        Input {index + 1}:{" "}
                        {formatTestCaseArgs(
                          getCatalogSnapshot(currentQuestion).paramNames,
                          testCase.args
                        )}
                      </div>
                      <div>Output: {JSON.stringify(testCase.expected)}</div>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">JavaScript</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outlinePrimary"
                    size="sm"
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmittingAnswer}
                    className="flex items-center gap-1"
                    data-cy="live-interview-run-code"
                  >
                    <Play className="h-3 w-3" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  <Button
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmittingAnswer}
                    data-cy="live-interview-submit-code"
                  >
                    {isSubmittingAnswer ? "Judging..." : "Submit Answer"}
                  </Button>
                </div>
              </div>

              <div className="h-72 rounded-md border overflow-hidden">
                <CodeEditor
                  value={currentDraft}
                  onChange={(value) =>
                    setAnswerDrafts((prev) => ({ ...prev, [currentQuestion.id]: value }))
                  }
                />
              </div>

              {runResult && (
                <div className="max-h-64 overflow-y-auto">
                  <TestResultsPanel
                    result={runResult}
                    paramNames={getCatalogSnapshot(currentQuestion).paramNames}
                  />
                </div>
              )}
            </div>
          )}

          {isCoding && !isCodingCatalog && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Write your solution below. This question isn't backed by the
                live problem catalog, so it isn't auto-judged against test
                cases — just answer it as you would in a whiteboard round.
              </p>

              <div className="h-72 rounded-md border overflow-hidden">
                <CodeEditor
                  value={currentDraft}
                  onChange={(value) =>
                    setAnswerDrafts((prev) => ({ ...prev, [currentQuestion.id]: value }))
                  }
                />
              </div>

              <Button
                onClick={() => handleAnswerSubmit(currentDraft)}
                disabled={isSubmittingAnswer || !currentDraft.trim()}
                data-cy="live-interview-submit-code-fallback"
              >
                {isSubmittingAnswer ? "Submitting..." : "Save Answer"}
              </Button>
            </div>
          )}

          {!isMcq && !isCoding && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Your answer{" "}
                  <span className="text-muted-foreground font-normal">
                    — type it directly, or record it and edit the transcript below
                  </span>
                </label>
                <Textarea
                  value={
                    isListening ? `${currentDraft} ${interimTranscript}`.trim() : currentDraft
                  }
                  onChange={(e) =>
                    setAnswerDrafts((prev) => ({
                      ...prev,
                      [currentQuestion.id]: e.target.value,
                    }))
                  }
                  readOnly={isListening}
                  className="min-h-[120px]"
                  data-cy="live-interview-transcript"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={isListening ? "outlineDanger" : "outlinePrimary"}
                  onClick={isListening ? undefined : startListening}
                  disabled={isListening || isSubmittingAnswer}
                  className="flex items-center gap-2"
                  data-cy="live-interview-start-listening"
                >
                  <Mic className="h-4 w-4" />
                  {isListening ? "Listening..." : "Record Answer"}
                </Button>

                {isListening && (
                  <Button
                    variant="secondary"
                    onClick={stopListening}
                    className="flex items-center gap-2"
                    data-cy="live-interview-done-answering"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </Button>
                )}

                <Button
                  onClick={() => handleAnswerSubmit(currentDraft)}
                  disabled={isSubmittingAnswer || isListening || !currentDraft.trim()}
                  data-cy="live-interview-submit-answer"
                >
                  {isSubmittingAnswer ? "Submitting..." : "Save Answer"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showUnansweredModal}
        onOpenChange={(open) => !open && setShowUnansweredModal(false)}
      >
        <DialogContent
          onClose={() => setShowUnansweredModal(false)}
          data-cy="live-interview-unanswered-modal"
        >
          <DialogHeader>
            <DialogTitle>
              You haven't answered {unansweredQuestions.length}{" "}
              {unansweredQuestions.length === 1 ? "question" : "questions"}
            </DialogTitle>
            <DialogDescription>
              Click a question below to go answer it, or submit anyway if you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {unansweredQuestions.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleJumpToUnanswered(q.id)}
                className="w-full text-left rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
                data-cy="live-interview-unanswered-item"
              >
                Question {q.ordinal}: {getPromptTitle(q)}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlinePrimary"
              onClick={() => setShowUnansweredModal(false)}
              data-cy="live-interview-review-questions"
            >
              Review Questions
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmitAnyway}
              data-cy="live-interview-submit-anyway"
            >
              Submit Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showTabSwitchWarning}
        onOpenChange={(open) => !open && setShowTabSwitchWarning(false)}
      >
        <DialogContent
          onClose={() => setShowTabSwitchWarning(false)}
          data-cy="live-interview-tab-switch-warning"
        >
          <DialogHeader>
            <DialogTitle>Tab switch detected (warning {tabSwitchCount} of 2)</DialogTitle>
            <DialogDescription>
              Leaving this tab or window during the interview counts as a strike. After 3
              strikes, your interview will be automatically submitted as-is.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setShowTabSwitchWarning(false)}
              data-cy="live-interview-tab-switch-acknowledge"
            >
              I Understand, Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveInterviewPage;
