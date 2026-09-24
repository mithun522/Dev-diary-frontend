import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useFetchCatalogProblemsPaged } from "../../../api/hooks/useFetchCatalog";
import { useDebounce } from "../../../api/hooks/use-debounce";
import { CATALOG_SECTIONS } from "../../../constants/CatalogSections";
import CatalogTable from "./CatalogTable";
import ErrorPage from "../../ErrorPage";

const PracticeTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 1000);

  // Any filter change invalidates whatever page you were on - e.g. page 6 of an unfiltered
  // 400-problem list is very likely out of range for a narrowed-down "Graphs" section, so every
  // filter change (search settling, difficulty, section) jumps back to page 1 rather than leaving
  // the user on a now-nonsensical page number.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, difficultyFilter, sectionFilter]);

  const {
    data,
    totalPages,
    isLoading,
    error,
  } = useFetchCatalogProblemsPaged({
    search: debouncedSearch,
    difficulty: difficultyFilter,
    section: sectionFilter,
    page,
  });

  const problems = data?.problems ?? [];

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
        <div className="flex gap-2">
          <Select
            value={sectionFilter || "all"}
            onValueChange={(value) => setSectionFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[220px]" data-cy="practice-section-filter-trigger">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent data-cy="practice-section-filter-content">
              <SelectGroup>
                <SelectItem value="all">All Topics</SelectItem>
                {CATALOG_SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
      </div>

      <CatalogTable
        isLoadingFetch={isLoading}
        fetchedProblems={problems}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PracticeTab;
