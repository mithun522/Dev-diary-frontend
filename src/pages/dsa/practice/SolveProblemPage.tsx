import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import ErrorPage from "../../ErrorPage";
import {
  useFetchCatalogProblemDetail,
  useRunSolution,
  useSubmitSolution,
} from "../../../api/hooks/useFetchCatalog";
import { getDifficultyColor } from "../../../utils/colorVariations";
import {
  convertToPascalCase,
  pascalizeUnderscore,
} from "../../../utils/convertToPascalCase";
import { TopicColors, type Topic } from "../../../constants/Topics";
import { logger } from "../../../utils/logger";
import type { JudgeResult } from "../../../data/catalogData";
import { formatTestCaseArgs } from "../../../utils/formatTestCaseArgs";
import CodeEditor from "./CodeEditor";
import TestResultsPanel from "./TestResultsPanel";
import SubmissionHistory from "./SubmissionHistory";

// Solving a problem is a multi-visit activity — persist the in-progress draft per problem so
// navigating away (or an accidental refresh) doesn't lose unsaved work.
const draftKey = (id: string) => `dsa-practice-draft-${id}`;

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const SolveProblemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: problem, isLoading, error } = useFetchCatalogProblemDetail(id);
  const [sourceCode, setSourceCode] = useState("");
  const [activeResult, setActiveResult] = useState<JudgeResult | null>(null);

  useEffect(() => {
    if (!problem) return;
    const draft = localStorage.getItem(draftKey(problem.id));
    setSourceCode(draft ?? problem.starterCode);
  }, [problem]);

  useEffect(() => {
    if (!problem) return;
    localStorage.setItem(draftKey(problem.id), sourceCode);
  }, [problem, sourceCode]);

  const runMutation = useRunSolution(id ?? "");
  const submitMutation = useSubmitSolution(id ?? "");

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
        logger.error("Error running solution:", err);
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
        logger.error("Error submitting solution:", err);
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
    <div className="h-full flex flex-col gap-4" data-cy="solve-problem-page">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dsa")}
          data-cy="solve-back"
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold" data-cy="solve-title">
          {problem.title}
        </h1>
        <Badge
          variant="outline"
          className={`${getDifficultyColor(problem.difficulty)} text-white`}
        >
          {convertToPascalCase(problem.difficulty)}
        </Badge>
        {problem.topics.map((topic: Topic) => (
          <Badge key={topic} className={`text-xs ${TopicColors[topic]}`}>
            {pascalizeUnderscore(topic)}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-w-0">
        <div className="lg:w-2/5 flex flex-col min-h-0 min-w-0">
          <Tabs defaultValue="description" className="flex flex-col flex-1 min-h-0">
            <TabsList>
              <TabsTrigger value="description" data-cy="solve-tab-description">
                Description
              </TabsTrigger>
              <TabsTrigger value="submissions" data-cy="solve-tab-submissions">
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="flex-1 min-h-0 overflow-y-auto pt-4 space-y-4"
            >
              <MarkdownPreview source={problem.description} />
              <div>
                <h3 className="font-semibold mb-2">Sample test cases</h3>
                <div className="space-y-2">
                  {problem.sampleTestCases.map((testCase, index) => (
                    <div
                      key={testCase.id}
                      className="rounded-md border p-3 text-sm font-mono"
                    >
                      <div>Input {index + 1}: {formatTestCaseArgs(problem.paramNames, testCase.args)}</div>
                      <div>Output: {JSON.stringify(testCase.expected)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="submissions"
              className="flex-1 min-h-0 overflow-y-auto pt-4"
            >
              <SubmissionHistory problemId={problem.id} onSelect={setSourceCode} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-3/5 flex flex-col min-h-0 min-w-0 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">JavaScript</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outlinePrimary"
                size="sm"
                onClick={handleRun}
                disabled={runMutation.isPending || submitMutation.isPending}
                data-cy="solve-run"
              >
                {runMutation.isPending ? "Running..." : "Run"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={submitMutation.isPending || runMutation.isPending}
                data-cy="solve-submit"
              >
                {submitMutation.isPending ? "Judging..." : "Submit"}
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] min-w-0 rounded-md border overflow-hidden">
            <CodeEditor value={sourceCode} onChange={setSourceCode} />
          </div>

          {activeResult && (
            <div className="max-h-64 overflow-y-auto">
              <TestResultsPanel result={activeResult} paramNames={problem.paramNames} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolveProblemPage;
