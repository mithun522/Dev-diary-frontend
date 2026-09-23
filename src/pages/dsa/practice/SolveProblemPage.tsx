import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
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
import type { JudgeResult, StarterCodeByLanguage } from "../../../data/catalogData";
import { formatTestCaseArgs } from "../../../utils/formatTestCaseArgs";
import {
  CODE_EXECUTION_LANGUAGE_OPTIONS,
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../../constants/Languages";
import CodeEditor from "./CodeEditor";
import TestResultsPanel from "./TestResultsPanel";
import SubmissionHistory from "./SubmissionHistory";

// Solving a problem is a multi-visit activity — persist the in-progress draft per problem *and*
// per language so switching languages doesn't clobber work left in another one, and a reload
// picks up where you left off in whichever language was open.
const draftKey = (id: string, language: CodeExecutionLanguage) =>
  `dsa-practice-draft-${id}-${language}`;

// Only offer the languages this problem actually has admin-authored starter code for.
const availableLanguages = (starterCode: StarterCodeByLanguage): CodeExecutionLanguage[] =>
  CODE_EXECUTION_LANGUAGE_OPTIONS.map((option) => option.value).filter(
    (lang) => !!starterCode[lang]
  );

const initialCodeFor = (
  problem: { id: string; starterCode: StarterCodeByLanguage } | undefined,
  language: CodeExecutionLanguage
): string => {
  if (!problem) return "";
  const draft = localStorage.getItem(draftKey(problem.id, language));
  if (draft !== null) return draft;
  return problem.starterCode[language] ?? "";
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const SolveProblemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: problem,
    isLoading,
    isFetching,
    error,
  } = useFetchCatalogProblemDetail(id);
  const [codeByLanguage, setCodeByLanguage] = useState<
    Partial<Record<CodeExecutionLanguage, string>>
  >({});
  const [activeResult, setActiveResult] = useState<JudgeResult | null>(null);
  const [language, setLanguage] = useState<CodeExecutionLanguage>(
    CodeExecutionLanguages.JAVASCRIPT
  );
  const sourceCode = codeByLanguage[language] ?? "";
  const setSourceCode = (value: string) =>
    setCodeByLanguage((prev) => ({ ...prev, [language]: value }));
  const problemLanguages = problem ? availableLanguages(problem.starterCode) : [];

  // A fresh problem invalidates every cached language's code — otherwise navigating from one
  // problem straight to another (same route, no unmount) would show the previous problem's code.
  // It also resets the selected language to whichever one the new problem actually offers.
  useEffect(() => {
    setCodeByLanguage({});
    if (!problem) return;
    const languages = availableLanguages(problem.starterCode);
    setLanguage(
      languages.includes(CodeExecutionLanguages.JAVASCRIPT)
        ? CodeExecutionLanguages.JAVASCRIPT
        : languages[0] ?? CodeExecutionLanguages.JAVASCRIPT
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  useEffect(() => {
    if (!problem) return;
    setCodeByLanguage((prev) =>
      language in prev ? prev : { ...prev, [language]: initialCodeFor(problem, language) }
    );
  }, [problem, language]);

  useEffect(() => {
    if (!problem || !(language in codeByLanguage)) return;
    localStorage.setItem(draftKey(problem.id, language), codeByLanguage[language] ?? "");
  }, [problem, language, codeByLanguage]);

  const runMutation = useRunSolution(id ?? "");
  const submitMutation = useSubmitSolution(id ?? "");

  const handleRun = () => {
    runMutation.mutate({ sourceCode, language }, {
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
    submitMutation.mutate({ sourceCode, language }, {
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
    return <SolveProblemSkeleton />;
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
        {typeof problem.score === "number" && (
          <Badge variant="secondary" data-cy="solve-score">
            {problem.score} pts
          </Badge>
        )}
        {problem.topics.map((topic: Topic) => (
          <Badge key={topic} className={`text-xs ${TopicColors[topic]}`}>
            {pascalizeUnderscore(topic)}
          </Badge>
        ))}
      </div>

      <div
        className={`flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-w-0 transition-opacity duration-200 ${
          isFetching ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
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
              <SubmissionHistory
                problemId={problem.id}
                onSelect={(code, submissionLanguage) => {
                  setLanguage(submissionLanguage);
                  setCodeByLanguage((prev) => ({ ...prev, [submissionLanguage]: code }));
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-3/5 flex flex-col min-h-0 min-w-0 gap-3">
          <div className="flex items-center justify-between">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodeExecutionLanguage)}
              className="text-sm text-muted-foreground bg-transparent border rounded-md px-2 py-1"
              data-cy="solve-language-select"
            >
              {CODE_EXECUTION_LANGUAGE_OPTIONS.filter((option) =>
                problemLanguages.includes(option.value)
              ).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <CodeEditor value={sourceCode} onChange={setSourceCode} language={language} />
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

const SolveProblemSkeleton: React.FC = () => (
  <div
    className="h-full flex flex-col gap-4 animate-in fade-in duration-300"
    data-cy="solve-problem-skeleton"
  >
    <div className="flex items-center gap-3 flex-wrap">
      <Skeleton className="h-8 w-8 shrink-0" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>

    <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 min-w-0">
      <div className="lg:w-2/5 flex flex-col min-h-0 min-w-0">
        <div className="flex gap-2 border-b pb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="pt-4 space-y-3">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="lg:w-3/5 flex flex-col min-h-0 min-w-0 gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <Skeleton className="flex-1 min-h-[300px] w-full rounded-md" />
      </div>
    </div>
  </div>
);

export default SolveProblemPage;
