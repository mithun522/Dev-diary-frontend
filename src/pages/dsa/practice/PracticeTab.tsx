import { useState } from "react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useFetchCatalogProblems } from "../../../api/hooks/useFetchCatalog";
import { useDebounce } from "../../../api/hooks/use-debounce";
import CatalogTable from "./CatalogTable";
import ErrorPage from "../../ErrorPage";

const PracticeTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 1000);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchCatalogProblems({
    search: debouncedSearch,
    difficulty: difficultyFilter,
  });

  const problems = data?.pages?.flatMap((page) => page.problems) ?? [];

  if (error) return <ErrorPage message="Failed to fetch practice problems" />;

  return (
    <div className="space-y-4" data-cy="practice-tab">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search problems by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            data-cy="practice-search"
          />
        </div>
        <Select
          value={difficultyFilter || "all"}
          onValueChange={(value) => setDifficultyFilter(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[120px]" data-cy="practice-difficulty-filter-trigger">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent data-cy="practice-difficulty-filter-content">
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <CatalogTable
        isLoadingFetch={isLoading}
        fetchedProblems={problems}
        fetchNextPage={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default PracticeTab;
