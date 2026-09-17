import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import ErrorPage from "../../ErrorPage";
import {
  useCurriculumProblemDetail,
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
  const { data: problem, isLoading, error } = useCurriculumProblemDetail(problemId ?? "");
  const [sourceCode, setSourceCode] = useState("");
  const [activeResult, setActiveResult] = useState<CurriculumRunResult | null>(null);

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

  const runMutation = useRunCurriculumSolution(problemId ?? "");
  const submitMutation = useSubmitCurriculumSolution(problemId ?? "");

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
    return <div className="h-40 w-full bg-gray-300 animate-pulse rounded" />;
  }

  return (
    <div className="h-full flex flex-col gap-4" data-cy="curriculum-solve-page">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dsa")}
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
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-w-0">
        <div className="lg:w-2/5 flex flex-col min-h-0 min-w-0 overflow-y-auto pt-2 space-y-4">
          <MarkdownPreview source={problem.description} />
          <div>
            <h3 className="font-semibold mb-2">Sample output</h3>
            <div className="space-y-2">
              {problem.sampleTestCases.map((testCase, index) => (
                <div
                  key={testCase.id}
                  className="rounded-md border p-3 text-sm font-mono whitespace-pre-wrap"
                >
                  <div>Sample {index + 1}: {testCase.expectedStdout}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-3/5 flex flex-col min-h-0 min-w-0 gap-3">
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
        </div>
      </div>
    </div>
  );
};

export default CurriculumSolveProblemPage;
