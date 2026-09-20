import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useCatalogCategories } from "../../../api/hooks/useTechInterviewCatalog";
import ErrorPage from "../../ErrorPage";

// This tab is a compact entry point into the full catalog, not the browsing surface itself — the
// catalog got too large for an in-tab accordion (AWS alone is 267 questions across 57 topics), so
// stack/topic/question browsing and search now live on their own dedicated, shareable pages under
// /technical-interview/catalog. This tab just previews the categories and links out to them.
const QuestionBankTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useCatalogCategories();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      navigate(`/technical-interview/catalog/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch the question bank" />;

  return (
    <div className="space-y-4" data-cy="tech-interview-catalog-tab">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search the question bank..."
          className="pl-9"
          data-cy="tech-interview-catalog-search"
        />
      </form>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories
            .flatMap((category) => category.stacks)
            .map((stackSummary) => (
              <Link
                key={stackSummary.stack}
                to={`/technical-interview/catalog/${encodeURIComponent(stackSummary.stack)}`}
                data-cy="tech-interview-catalog-stack-card"
              >
                <Card className="cursor-pointer hover:bg-accent h-full">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{stackSummary.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stackSummary.topicCount} topics &middot;{" "}
                      {stackSummary.questionCount} questions
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          The question bank is empty for now.
        </p>
      )}

      <Link
        to="/technical-interview/catalog"
        className="flex items-center gap-1 text-sm text-primary hover:underline"
        data-cy="tech-interview-catalog-browse-all"
      >
        Browse the full question bank <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default QuestionBankTab;
