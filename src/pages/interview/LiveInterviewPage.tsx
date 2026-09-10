import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  ArrowLeft,
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
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Textarea } from "../../components/ui/textarea";
import {
  startInterviewSession,
  endInterviewSession,
  runSessionCodingQuestion,
  submitSessionCodingQuestion,
  answerSessionQuestion,
  isCodingCatalogQuestion,
  type InterviewSession,
  type InterviewSessionQuestion,
  type MockQuestionSnapshot,
  type DsaCatalogSnapshot,
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
// -> "ending" and stop the moment the candidate finishes the last question.
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
  const [answerText, setAnswerText] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [runResult, setRunResult] = useState<JudgeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const setupStarted = useRef(false);
  const speechSupported = isSpeechRecognitionSupported();
  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

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

  // Reset per-question draft state whenever the current question changes.
  useEffect(() => {
    if (!currentQuestion) return;
    resetTranscript();
    setAnswerText("");
    setRunResult(null);
    if (currentQuestion.type === "coding") {
      setSourceCode(
        isCodingCatalogQuestion(currentQuestion)
          ? getCatalogSnapshot(currentQuestion).starterCode ?? ""
          : getMockSnapshot(currentQuestion).boilerplate ?? ""
      );
    } else {
      setSourceCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    setAnswerText(finalTranscript);
  }, [finalTranscript]);

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
        const newSession = await startInterviewSession(mockInterviewId);
        if (newSession.questions.length === 0) {
          setLoadError("This interview has no questions yet.");
          return;
        }

        setSession(newSession);
        setQuestions(newSession.questions);
        startRecording(newSession.id);
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
      stopAndFinalize();

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

  const applyAnsweredQuestion = useCallback(
    (updated: InterviewSessionQuestion) => {
      const updatedQuestions = questions.map((q) =>
        q.id === updated.id ? updated : q
      );
      setQuestions(updatedQuestions);

      if (isLastQuestion && session) {
        finishSession(session);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [questions, isLastQuestion, session, finishSession]
  );

  const handleAnswerSubmit = useCallback(
    async (answerValue: string) => {
      if (!session || !currentQuestion) return;
      if (!answerValue.trim()) {
        toast.error("Give an answer before continuing.");
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
        sourceCode
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
        sourceCode
      );
      applyAnsweredQuestion(updated);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't submit your solution."));
    } finally {
      setIsSubmittingAnswer(false);
    }
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

            {session.videoStatus === "processing" && (
              <p className="text-sm text-muted-foreground border-t pt-3">
                Your recording is queued for processing.
              </p>
            )}

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
            <p className="text-muted-foreground">Finishing up...</p>
          </>
        )}
      </div>
    );
  }

  const isMcq = currentQuestion.type === "mcq";
  const isCoding = currentQuestion.type === "coding";
  const isCodingCatalog = isCodingCatalogQuestion(currentQuestion);
  const questionNumber = currentIndex + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-cy="live-interview-page">
      {recordingIndicator}

      <div className="flex items-center justify-between">
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => navigate("/interview")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </Button>
        <span className="text-sm text-muted-foreground">
          Question {questionNumber} of {questions.length}
        </span>
      </div>

      <Progress
        value={(questionNumber / questions.length) * 100}
        data-cy="live-interview-progress"
      />

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
                  variant="outlinePrimary"
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
                    {isSubmittingAnswer
                      ? "Judging..."
                      : isLastQuestion
                      ? "Submit & Finish Interview"
                      : "Submit & Continue"}
                  </Button>
                </div>
              </div>

              <div className="h-72 rounded-md border overflow-hidden">
                <CodeEditor value={sourceCode} onChange={setSourceCode} />
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
                <CodeEditor value={sourceCode} onChange={setSourceCode} />
              </div>

              <Button
                onClick={() => handleAnswerSubmit(sourceCode)}
                disabled={isSubmittingAnswer}
                data-cy="live-interview-submit-code-fallback"
              >
                {isSubmittingAnswer
                  ? "Submitting..."
                  : isLastQuestion
                  ? "Submit & Finish Interview"
                  : "Submit & Continue"}
              </Button>
            </div>
          )}

          {!isMcq && !isCoding && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  variant={isListening ? "outlineDanger" : "primary"}
                  onClick={isListening ? undefined : startListening}
                  disabled={isListening || isSubmittingAnswer}
                  className="flex items-center gap-2"
                  data-cy="live-interview-start-listening"
                >
                  <Mic className="h-4 w-4" />
                  {isListening ? "Listening..." : "Start Answering"}
                </Button>

                {isListening && (
                  <Button
                    variant="secondary"
                    onClick={stopListening}
                    className="flex items-center gap-2"
                    data-cy="live-interview-done-answering"
                  >
                    <MicOff className="h-4 w-4" />
                    I'm Done Answering
                  </Button>
                )}
              </div>

              {(isListening || answerText) && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Live transcript{" "}
                    {isListening && (
                      <span className="text-muted-foreground font-normal">
                        (edit after stopping if it mis-heard you)
                      </span>
                    )}
                  </label>
                  <Textarea
                    value={
                      isListening
                        ? `${answerText} ${interimTranscript}`.trim()
                        : answerText
                    }
                    onChange={(e) => setAnswerText(e.target.value)}
                    readOnly={isListening}
                    className="min-h-[120px]"
                    data-cy="live-interview-transcript"
                  />
                </div>
              )}

              {!isListening && answerText && (
                <Button
                  onClick={() => handleAnswerSubmit(answerText)}
                  disabled={isSubmittingAnswer}
                  data-cy="live-interview-submit-answer"
                >
                  {isSubmittingAnswer
                    ? "Submitting..."
                    : isLastQuestion
                    ? "Finish Interview"
                    : "Save & Continue"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveInterviewPage;
