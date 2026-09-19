import MarkdownPreview from "@uiw/react-markdown-preview";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { useCatalogQuestion } from "../../../api/hooks/useTechInterviewCatalog";
import { CATALOG_DIFFICULTY_COLORS, type CatalogDifficulty } from "../../../data/techInterviewCatalogData";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";

interface CatalogQuestionRowProps {
  slug: string;
  question: string;
  difficulty: CatalogDifficulty;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
}

// Answer/notes are fetched lazily (only once expanded) and cached by react-query, so collapsing
// and re-expanding the same question is instant on the second open — no popup, everything renders
// inline right below the question it belongs to.
const CatalogQuestionRow: React.FC<CatalogQuestionRowProps> = ({
  slug,
  question,
  difficulty,
  subtitle,
  expanded,
  onToggle,
}) => {
  const { data: detail, isLoading } = useCatalogQuestion(expanded ? slug : "");

  return (
    <div className="rounded-md border" data-cy="tech-interview-catalog-question-row">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-3 text-left"
      >
        <div className="min-w-0">
          <p className="font-medium">{question}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={CATALOG_DIFFICULTY_COLORS[difficulty]}>
            {pascalizeUnderscore(difficulty)}
          </Badge>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t space-y-4" data-cy="tech-interview-catalog-answer">
          {isLoading || !detail ? (
            <div className="space-y-2 mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <>
              <div className="bg-muted/50 p-4 rounded-lg prose dark:prose-invert max-w-none">
                <MarkdownPreview source={detail.answer} />
              </div>
              {detail.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <div className="bg-muted/30 p-4 rounded-lg prose dark:prose-invert max-w-none">
                    <MarkdownPreview source={detail.notes} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogQuestionRow;
