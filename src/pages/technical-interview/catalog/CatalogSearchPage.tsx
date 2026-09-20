import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";
import Button from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useDebounce } from "../../../api/hooks/use-debounce";
import { useCatalogCategories } from "../../../api/hooks/useTechInterviewCatalog";
import { useSearchCatalogQuestions } from "../../../api/hooks/useTechInterviewCatalog";
import {
  CatalogDifficulties,
  type CatalogDifficulty,
} from "../../../data/techInterviewCatalogData";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import ErrorPage from "../../ErrorPage";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogQuestionRow from "./CatalogQuestionRow";

// q/category/stack/difficulty/page all live in the URL so a search (and a specific page of
// results) is shareable/bookmarkable — the only place in this app that syncs search state to
// the URL today.
const CatalogSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const stack = searchParams.get("stack") ?? "";
  const difficulty = (searchParams.get("difficulty") as CatalogDifficulty | null) ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const [queryInput, setQueryInput] = useState(q);
  const debouncedQuery = useDebounce(queryInput, 500);

  const { data: categories } = useCatalogCategories();
  const stackOptions = category
    ? categories?.find((c) => c.slug === category)?.stacks ?? []
    : categories?.flatMap((c) => c.stacks) ?? [];

  const updateParams = (next: Record<string, string>) => {
    const merged = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });
    setSearchParams(merged);
  };

  // Debounced query typing resets to page 1 and only fires once the value actually settles.
  useEffect(() => {
    if (debouncedQuery !== q) {
      updateParams({ q: debouncedQuery, page: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const {
    data: results,
    isLoading,
    isFetching,
    error,
  } = useSearchCatalogQuestions({
    q,
    category: category || undefined,
    stack: stack || undefined,
    difficulty: difficulty || undefined,
    page,
  });

  if (error) return <ErrorPage message="Search failed. Please try again." />;

  const totalPages = results ? Math.max(1, Math.ceil(results.totalLength / results.pageSize)) : 1;

  return (
    <div className="space-y-6" data-cy="tech-interview-catalog-search-page">
      <CatalogBreadcrumb
        items={[
          { label: "Technical Interview", to: "/technical-interview" },
          { label: "Question Bank", to: "/technical-interview/catalog" },
          { label: "Search" },
        ]}
      />

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search the question bank..."
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          className="pl-9"
          data-cy="tech-interview-catalog-search-input"
          autoFocus
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={category || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? "" : value, stack: "", page: "" })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={stack || "all"}
          onValueChange={(value) => updateParams({ stack: value === "all" ? "" : value, page: "" })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stacks</SelectItem>
            {stackOptions.map((s) => (
              <SelectItem key={s.stack} value={s.stack}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficulty || "all"}
          onValueChange={(value) =>
            updateParams({ difficulty: value === "all" ? "" : value, page: "" })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            {Object.values(CatalogDifficulties).map((d) => (
              <SelectItem key={d} value={d}>
                {pascalizeUnderscore(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {!q.trim() ? (
          <p className="text-center text-muted-foreground py-6">
            Start typing to search the question bank.
          </p>
        ) : isLoading || isFetching ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))
        ) : results && results.results.length > 0 ? (
          <>
            {results.results.map((result) => (
              <CatalogQuestionRow
                key={result.slug}
                slug={result.slug}
                question={result.question}
                difficulty={result.difficulty}
                subtitle={`${result.stackLabel} · ${result.topic}`}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outlinePrimary"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outlinePrimary"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No matching questions found.
          </p>
        )}
      </div>
    </div>
  );
};

export default CatalogSearchPage;
