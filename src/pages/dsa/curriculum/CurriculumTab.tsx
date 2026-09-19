import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  CODE_EXECUTION_LANGUAGE_OPTIONS,
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../../constants/Languages";
import { CURRICULUM_LEVEL_COLORS } from "../../../data/curriculumData";
import {
  useCurriculumTopics,
  useCurriculumProblems,
} from "../../../api/hooks/useCurriculum";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import ErrorPage from "../../ErrorPage";

// One topic's row of problems for the currently selected language — a separate component so each
// topic only fetches its problems once expanded, not all topics up front.
const CurriculumTopicSection: React.FC<{
  topicId: string;
  title: string;
  description: string | null;
  language: CodeExecutionLanguage;
  expanded: boolean;
  onToggle: () => void;
}> = ({ topicId, title, description, language, expanded, onToggle }) => {
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
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
                <span className="font-medium">{problem.title}</span>
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
          topics.map((topic) => (
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
            />
          ))
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
