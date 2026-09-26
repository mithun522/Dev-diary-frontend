import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  CODE_EXECUTION_LANGUAGE_OPTIONS,
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../../constants/Languages";
import { CURRICULUM_LEVEL_COLORS } from "../../../data/curriculumData";
import {
  useCurriculumTopics,
  useCurriculumProblems,
  useCurriculumProgress,
} from "../../../api/hooks/useCurriculum";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import ErrorPage from "../../ErrorPage";
import { Progress } from "../../../components/ui/progress";
import { AlertTriangle } from "lucide-react";

// One topic's row of problems for the currently selected language — a separate component so each
// topic only fetches its problems once expanded, not all topics up front.
const CurriculumTopicSection: React.FC<{
  topicId: string;
  title: string;
  description: string | null;
  language: CodeExecutionLanguage;
  expanded: boolean;
  onToggle: () => void;
  solvedCount?: number;
  totalCount?: number;
}> = ({
  topicId,
  title,
  description,
  language,
  expanded,
  onToggle,
  solvedCount,
  totalCount,
}) => {
  const navigate = useNavigate();
  const { data: problems, isLoading } = useCurriculumProblems(
    expanded ? topicId : "",
    language
  );

  return (
    <Card data-cy="curriculum-topic-section">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
        data-cy="curriculum-topic-toggle"
      >
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {totalCount !== undefined && totalCount > 0 && (
            <span
              className="text-xs text-muted-foreground whitespace-nowrap"
              data-cy="curriculum-topic-progress"
            >
              {solvedCount}/{totalCount} solved
            </span>
          )}
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : problems && problems.length > 0 ? (
            problems.map((problem) => (
              <div
                key={problem.id}
                onClick={() => navigate(`/dsa/curriculum/${problem.id}`)}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-accent"
                data-cy="curriculum-problem-row"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {problem.solved && (
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400 shrink-0"
                      data-cy="curriculum-problem-solved-icon"
                    />
                  )}
                  <span className="font-medium truncate">{problem.title}</span>
                </div>
                <Badge className={CURRICULUM_LEVEL_COLORS[problem.level]}>
                  {pascalizeUnderscore(problem.level)}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No problems yet for this language in this topic.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const CurriculumTab: React.FC = () => {
  const [language, setLanguage] = useState<CodeExecutionLanguage>(
    CodeExecutionLanguages.JAVASCRIPT
  );
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const { data: topics, isLoading, error } = useCurriculumTopics();
  // Scoped to the selected language so a topic's "X/Y solved" always matches the problems that
  // topic's own (language-filtered) list is about to show once expanded.
  const {
    data: progress,
    isLoading: isProgressLoading,
    isError: isProgressError,
  } = useCurriculumProgress(language);
  const progressByTopic = new Map(
    progress?.byTopic.map((topicProgress) => [topicProgress.topicId, topicProgress])
  );
  const overallPct =
    progress && progress.totalProblems > 0
      ? Math.round((progress.solvedProblems / progress.totalProblems) * 100)
      : 0;

  if (error) return <ErrorPage message="Failed to fetch curriculum topics" />;

  return (
    <div className="space-y-4" data-cy="curriculum-tab">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Practice a language's own syntax — printing, conditions, loops, and functions — before
          moving on to full coding problems.
        </p>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as CodeExecutionLanguage)}
          className="text-sm bg-transparent border rounded-md px-2 py-1"
          data-cy="curriculum-language-select"
        >
          {CODE_EXECUTION_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isProgressError ? (
        // Non-blocking: progress is a secondary data source layered on top of the topic list, so
        // a failure here shouldn't hide the topics themselves the way the ErrorPage guard above
        // does for a genuine failure to load the topic list.
        <div
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          data-cy="curriculum-progress-error"
        >
          <AlertTriangle size={16} className="shrink-0" />
          Couldn't load your progress — solved counts below may be missing or stale.
        </div>
      ) : !isProgressLoading && progress ? (
        <div
          className="rounded-lg border p-4 space-y-2"
          data-cy="curriculum-overall-progress"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground">
              {progress.solvedProblems}/{progress.totalProblems} solved ({overallPct}%)
            </span>
          </div>
          <Progress value={overallPct} className="h-2" />
        </div>
      ) : null}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </Card>
          ))
        ) : topics && topics.length > 0 ? (
          topics.map((topic) => {
            const topicProgress = progressByTopic.get(topic.id);
            return (
              <CurriculumTopicSection
                key={topic.id}
                topicId={topic.id}
                title={topic.title}
                description={topic.description}
                language={language}
                expanded={expandedTopicId === topic.id}
                onToggle={() =>
                  setExpandedTopicId((prev) => (prev === topic.id ? null : topic.id))
                }
                solvedCount={topicProgress?.solved}
                totalCount={topicProgress?.total}
              />
            );
          })
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No curriculum topics yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default CurriculumTab;
