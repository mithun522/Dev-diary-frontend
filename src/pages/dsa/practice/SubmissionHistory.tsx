import { Badge } from "../../../components/ui/badge";
import { formatDate } from "../../../utils/formatDate";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { useFetchSubmissions } from "../../../api/hooks/useFetchCatalog";
import { CODE_EXECUTION_LANGUAGE_OPTIONS, type CodeExecutionLanguage } from "../../../constants/Languages";

const STATUS_BADGE: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  WRONG_ANSWER: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  RUNTIME_ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  COMPILE_ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  TIMED_OUT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
};

const languageLabel = (language: CodeExecutionLanguage): string =>
  CODE_EXECUTION_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ??
  language;

interface SubmissionHistoryProps {
  problemId: string;
  // Selecting a past submission must also switch the editor to the language it was written in —
  // otherwise its source gets dropped into whatever language happens to be selected right now.
  onSelect: (sourceCode: string, language: CodeExecutionLanguage) => void;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ problemId, onSelect }) => {
  const { data: submissions, isLoading } = useFetchSubmissions(problemId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-gray-300 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No submissions yet for this problem.
      </p>
    );
  }

  return (
    <div className="space-y-2" data-cy="practice-submission-history">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(submission.sourceCode, submission.language)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              onSelect(submission.sourceCode, submission.language);
          }}
          className="w-full flex items-center justify-between rounded-md border p-3 text-sm cursor-pointer hover:bg-muted transition-colors"
          data-cy="practice-submission-row"
        >
          <Badge className={STATUS_BADGE[submission.status] ?? ""}>
            {pascalizeUnderscore(submission.status)}
          </Badge>
          <span className="text-muted-foreground">{languageLabel(submission.language)}</span>
          <span className="text-muted-foreground">{submission.runtimeMs}ms</span>
          <span className="text-muted-foreground">{formatDate(submission.createdAt)}</span>
        </div>
      ))}
    </div>
  );
};

export default SubmissionHistory;
