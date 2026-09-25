import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../../../components/ui/resizable";
import ErrorPage from "../../ErrorPage";
import {
  useCurriculumProblemDetail,
  useCurriculumProblems,
  useCurriculumTopics,
  useRunCurriculumSolution,
  useSubmitCurriculumSolution,
} from "../../../api/hooks/useCurriculum";
import { CURRICULUM_LEVEL_COLORS } from "../../../data/curriculumData";
import type { CurriculumRunResult } from "../../../data/curriculumData";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { logger } from "../../../utils/logger";
import CodeEditor from "../practice/CodeEditor";
import CurriculumResultsPanel from "./CurriculumResultsPanel";

const draftKey = (problemId: string) => `dsa-curriculum-draft-${problemId}`;

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const CurriculumSolveProblemPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // If we arrived here via an in-app navigation (a history entry exists), step back to it so the
  // caller's state (e.g. which DSA Prep tab was active) is preserved. A direct/deep link has no
  // such entry — location.key is "default" — so fall back to the DSA Prep hub instead.
  const goBack = () =>
    location.key === "default" ? navigate("/dsa") : navigate(-1);
  const {
    data: problem,
    isLoading,
    isFetching,
    error,
  } = useCurriculumProblemDetail(problemId ?? "");
  const [sourceCode, setSourceCode] = useState("");
  const [activeResult, setActiveResult] = useState<CurriculumRunResult | null>(null);
  const [pendingDirection, setPendingDirection] = useState<
    "previous" | "next" | null
  >(null);

  useEffect(() => {
    if (!isFetching) setPendingDirection(null);
  }, [isFetching]);

  // Seed the draft from localStorage (if the candidate left mid-solve) or the problem's starter
  // code, the first time the problem loads — same per-problem persistence idea as the catalog's
  // SolveProblemPage, just single-language here so no per-language keying is needed.
  useEffect(() => {
    if (!problem) return;
    const draft = localStorage.getItem(draftKey(problem.id));
    setSourceCode(draft !== null ? draft : problem.starterCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  useEffect(() => {
    if (!problem) return;
    localStorage.setItem(draftKey(problem.id), sourceCode);
  }, [problem, sourceCode]);

  useEffect(() => {
    setActiveResult(null);
  }, [problem?.id]);

  const runMutation = useRunCurriculumSolution(problemId ?? "");
  const submitMutation = useSubmitCurriculumSolution(problemId ?? "");

  const { data: topics } = useCurriculumTopics();
  const { data: topicProblems } = useCurriculumProblems(
    problem?.topicId ?? "",
    problem?.language
  );

  const topicIndex = useMemo(
    () => topics?.findIndex((topic) => topic.id === problem?.topicId) ?? -1,
    [topics, problem?.topicId]
  );
  const previousTopic =
    topicIndex > 0 ? topics?.[topicIndex - 1] : undefined;
  const nextTopic =
    topicIndex >= 0 && topics && topicIndex < topics.length - 1
      ? topics[topicIndex + 1]
      : undefined;

  const problemIndex = useMemo(
    () => topicProblems?.findIndex((item) => item.id === problem?.id) ?? -1,
    [topicProblems, problem?.id]
  );
  const isFirstInTopic = problemIndex === 0;
  const isLastInTopic =
    !!topicProblems && problemIndex === topicProblems.length - 1;

  const { data: previousTopicProblems } = useCurriculumProblems(
    isFirstInTopic && previousTopic ? previousTopic.id : "",
    problem?.language
  );
  const { data: nextTopicProblems } = useCurriculumProblems(
    isLastInTopic && nextTopic ? nextTopic.id : "",
    problem?.language
  );

  const previousProblemId = !isFirstInTopic
    ? topicProblems?.[problemIndex - 1]?.id
    : previousTopicProblems?.[previousTopicProblems.length - 1]?.id;
  const previousLabel = isFirstInTopic ? "Prev topic" : "Previous";
  const isPreviousDisabled =
    isFirstInTopic && !previousTopic ? true : !previousProblemId;

  const nextProblemId = !isLastInTopic
    ? topicProblems?.[problemIndex + 1]?.id
    : nextTopicProblems?.[0]?.id;
  const nextLabel = isLastInTopic ? "Next topic" : "Next";
  const isNextDisabled = isLastInTopic && !nextTopic ? true : !nextProblemId;

  const goToProblem = (id: string | undefined, direction: "previous" | "next") => {
    if (!id) return;
    setPendingDirection(direction);
    navigate(`/dsa/curriculum/${id}`);
  };

  const handleRun = () => {
    runMutation.mutate(sourceCode, {
      onSuccess: (result) => {
        setActiveResult(result);
        if (result.status === "ACCEPTED") {
          toast.success("All sample test cases passed.");
        } else {
          toast.error(`Run result: ${pascalizeUnderscore(result.status)}`);
        }
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to run solution"));
        logger.error("Error running curriculum solution:", err);
      },
    });
  };

  const handleSubmit = () => {
    submitMutation.mutate(sourceCode, {
      onSuccess: (submission) => {
        setActiveResult(submission);
        if (submission.status === "ACCEPTED") {
          toast.success("Accepted! All test cases passed.");
        } else {
          toast.error(`Submission judged: ${pascalizeUnderscore(submission.status)}`);
        }
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to submit solution"));
        logger.error("Error submitting curriculum solution:", err);
      },
    });
  };

  if (error) {
    return (
      <ErrorPage
        message="Failed to load this problem"
        onRetry={() => navigate("/dsa")}
      />
    );
  }

  if (isLoading || !problem) {
    return <CurriculumSolveProblemSkeleton />;
  }

  return (
    <div className="h-full flex flex-col gap-4" data-cy="curriculum-solve-page">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          data-cy="curriculum-solve-back"
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold" data-cy="curriculum-solve-title">
          {problem.title}
        </h1>
        <Badge className={CURRICULUM_LEVEL_COLORS[problem.level]}>
          {pascalizeUnderscore(problem.level)}
        </Badge>
        {problem.solved && (
          <Badge
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 flex items-center gap-1"
            data-cy="curriculum-solve-solved-badge"
          >
            <CheckCircle2 size={12} /> Solved
          </Badge>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outlinePrimary"
            size="sm"
            onClick={() => goToProblem(previousProblemId, "previous")}
            disabled={isPreviousDisabled || isFetching}
            className="flex items-center gap-1"
            data-cy="curriculum-solve-previous"
          >
            {pendingDirection === "previous" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {previousLabel}
          </Button>
          <Button
            variant="outlinePrimary"
            size="sm"
            onClick={() => goToProblem(nextProblemId, "next")}
            disabled={isNextDisabled || isFetching}
            className="flex items-center gap-1"
            data-cy="curriculum-solve-next"
          >
            {nextLabel}
            {pendingDirection === "next" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 min-h-0 min-w-0 transition-opacity duration-200 ${
          isFetching ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-col lg:flex-row !h-full"
        >
          <ResizablePanel
            defaultSize={40}
            minSize={25}
            className="flex flex-col min-h-0 min-w-0 overflow-y-auto pt-2 pr-2 space-y-4"
          >
            <div className="break-words [&_pre]:whitespace-pre-wrap [&_code]:break-words">
              <MarkdownPreview source={problem.description} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sample output</h3>
              <div className="space-y-2">
                {problem.sampleTestCases.map((testCase, index) => (
                  <div
                    key={testCase.id}
                    className="rounded-md border p-3 text-sm font-mono whitespace-pre-wrap break-words"
                  >
                    <div>Sample {index + 1}: {testCase.expectedStdout}</div>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="mx-2" />

          <ResizablePanel
            defaultSize={60}
            minSize={30}
            className="flex flex-col min-h-0 min-w-0 gap-3"
          >
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <Button
                  variant="outlinePrimary"
                  size="sm"
                  onClick={handleRun}
                  disabled={runMutation.isPending || submitMutation.isPending}
                  data-cy="curriculum-solve-run"
                >
                  {runMutation.isPending ? "Running..." : "Run"}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || runMutation.isPending}
                  data-cy="curriculum-solve-submit"
                >
                  {submitMutation.isPending ? "Judging..." : "Submit"}
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] min-w-0 rounded-md border overflow-hidden">
              <CodeEditor value={sourceCode} onChange={setSourceCode} language={problem.language} />
            </div>

            {activeResult && (
              <div className="max-h-64 overflow-y-auto">
                <CurriculumResultsPanel result={activeResult} />
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

const CurriculumSolveProblemSkeleton: React.FC = () => (
  <div
    className="h-full flex flex-col gap-4 animate-in fade-in duration-300"
    data-cy="curriculum-solve-skeleton"
  >
    <div className="flex items-center gap-3 flex-wrap">
      <Skeleton className="h-8 w-8 shrink-0" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <div className="flex items-center gap-2 ml-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>

    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-w-0">
      <div className="lg:w-2/5 flex flex-col min-h-0 min-w-0 pt-2 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-4 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      <div className="lg:w-3/5 flex flex-col min-h-0 min-w-0 gap-3">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="flex-1 min-h-[300px] w-full rounded-md" />
      </div>
    </div>
  </div>
);

export default CurriculumSolveProblemPage;
