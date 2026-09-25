import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Input } from "../../../components/ui/input";
import { useCatalogCategories } from "../../../api/hooks/useTechInterviewCatalog";
import { getStackIconMeta } from "../../../utils/stackIcons";
import ErrorPage from "../../ErrorPage";

// Browse root: a section per category, a card per stack. Content is entirely server-driven — new
// stacks/categories appear here automatically as they're seeded, nothing is hardcoded.
const CatalogBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useCatalogCategories();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      navigate(`/technical-interview/catalog/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  if (error) return <ErrorPage message="Failed to load the question bank" />;

  return (
    <div className="space-y-6" data-cy="tech-interview-catalog-browse">
      <div className="flex items-center gap-3">
        <Link
          to="/technical-interview"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Technical Interview
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Question Bank</h1>
        <p className="text-muted-foreground">
          Browse the shared, curated question catalog by category and stack.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search the question bank..."
          className="pl-9"
          data-cy="tech-interview-catalog-search"
        />
      </form>

      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                  <Card key={cardIndex}>
                    <CardContent className="pt-6 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="space-y-8">
          {categories.map((category) => (
            <section key={category.slug} data-cy="tech-interview-catalog-category">
              <h2 className="text-xl font-semibold mb-3">{category.label}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.stacks.map((stackSummary) => {
                  const { icon: StackIcon, color } = getStackIconMeta(
                    stackSummary.stack
                  );
                  return (
                    <Link
                      key={stackSummary.stack}
                      to={`/technical-interview/catalog/${encodeURIComponent(stackSummary.stack)}`}
                      data-cy="tech-interview-catalog-stack-card"
                    >
                      <Card className="cursor-pointer hover:bg-accent h-full">
                        <CardContent className="pt-6 flex items-start gap-3">
                          <StackIcon
                            className={`h-8 w-8 shrink-0 ${color ? "" : "text-primary"}`}
                            style={color ? { color } : undefined}
                          />
                          <div>
                            <h3 className="font-semibold">{stackSummary.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              {stackSummary.topicCount} topics &middot;{" "}
                              {stackSummary.questionCount} questions
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-6">
          The question bank is empty for now.
        </p>
      )}
    </div>
  );
};

export default CatalogBrowsePage;
