import { Badge } from "../../../components/ui/badge";
import type { CurriculumJudgeStatus, CurriculumRunResult } from "../../../data/curriculumData";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";

const STATUS_BADGE: Record<CurriculumJudgeStatus, string> = {
  ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  WRONG_ANSWER: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  RUNTIME_ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  COMPILE_ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  TIMED_OUT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
};

interface CurriculumResultsPanelProps {
  result: CurriculumRunResult;
}

// Curriculum problems are judged purely on captured stdout (expectedStdout/actualStdout), never
// a function's args/return value — a separate, simpler shape from the catalog's TestResultsPanel.
const CurriculumResultsPanel: React.FC<CurriculumResultsPanelProps> = ({ result }) => {
  const passedCount = result.results.filter((r) => r.passed).length;

  return (
    <div className="space-y-3" data-cy="curriculum-results">
      <div className="flex items-center gap-3">
        <Badge className={STATUS_BADGE[result.status]} data-cy="curriculum-results-status">
          {pascalizeUnderscore(result.status)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {passedCount}/{result.results.length} test cases passed &middot; {result.runtimeMs}ms
        </span>
      </div>

      <div className="space-y-2">
        {result.results.map((testCase, index) => (
          <div
            key={index}
            className={`rounded-md border p-3 text-sm ${
              testCase.passed
                ? "border-green-300 dark:border-green-800"
                : "border-red-300 dark:border-red-800"
            }`}
            data-cy="curriculum-results-case"
          >
            <div className="flex items-center justify-between font-medium">
              <span>Test case {index + 1}</span>
              <span className={testCase.passed ? "text-green-600" : "text-red-600"}>
                {testCase.passed ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="mt-1 grid gap-1 text-muted-foreground font-mono text-xs whitespace-pre-wrap break-words">
              <span>Expected output: {testCase.expectedStdout}</span>
              {!testCase.passed && (
                <span>Actual output: {testCase.actualStdout}</span>
              )}
              {testCase.error && <span className="text-red-500">Error: {testCase.error}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumResultsPanel;
