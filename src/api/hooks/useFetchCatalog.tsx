import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchCatalogProblemDetail,
  fetchCatalogProblems,
  fetchCatalogProgress,
  fetchSubmissions,
  generateTestCases,
  runSolution,
  submitSolution,
} from "../services/catalog.service";
import type { CatalogProblemPage } from "../../data/catalogData";
import type { CodeExecutionLanguage } from "../../constants/Languages";

// Must match dsa-service's catalogRepo.js PAGE_SIZE - the backend doesn't return it in the
// response, so it's mirrored here purely to compute how many numbered page buttons to render
// (totalPages = ceil(totalLength / CATALOG_PAGE_SIZE)). If the backend's page size ever changes,
// this needs to change with it (same kind of hand-kept-in-sync constant as CatalogSections.ts).
export const CATALOG_PAGE_SIZE = 10;

interface RunOrSubmitInput {
  sourceCode: string;
  language: CodeExecutionLanguage;
}

interface GenerateTestCasesInput {
  referenceSolution: string;
  referenceSolutionLanguage: CodeExecutionLanguage;
  referenceSolutionReturnType?: string;
}

interface FetchCatalogProps {
  search: string;
  difficulty: string;
}

// Accumulates pages into one growing list via "Load More" - kept as-is for AdminCatalogTable
// (doc 17's admin CRUD surface), which still uses that pattern. The Practice tab (candidate
// browsing) uses useFetchCatalogProblemsPaged below instead - see its own comment for why this
// isn't just one hook with two callers.
export const useFetchCatalogProblems = ({ search, difficulty }: FetchCatalogProps) => {
  return useInfiniteQuery<CatalogProblemPage, Error>({
    queryKey: ["catalog", search ?? "", difficulty ?? "NONE"],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchCatalogProblems(search, difficulty, Number(pageParam));
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.problems).length;

      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

interface FetchCatalogPagedProps {
  search: string;
  difficulty: string;
  section?: string;
  page: number;
}

// One page at a time (numbered pagination) for the Practice tab's candidate-facing catalog
// browse, instead of useFetchCatalogProblems' "Load More" accumulation above - a separate hook
// rather than repurposing that one, since AdminCatalogPage/AdminCatalogTable (doc 17) still
// consume the infinite-query shape and switching the shared hook's return type out from under
// them would break that unrelated surface. `placeholderData: keepPreviousData` keeps the current
// page's rows on screen while the next page loads, instead of flashing back to the loading
// skeleton on every click.
export const useFetchCatalogProblemsPaged = ({
  search,
  difficulty,
  section,
  page,
}: FetchCatalogPagedProps) => {
  const query = useQuery<CatalogProblemPage, Error>({
    queryKey: ["catalog", search ?? "", difficulty ?? "NONE", section ?? "NONE", page],
    // Normalized to "" here (not left for fetchCatalogProblems' own default param, which a mocked
    // service in tests bypasses entirely) - real callers always pass a real string anyway
    // (PracticeTab's sectionFilter starts at ""), but this keeps the hook correct on its own.
    queryFn: () => fetchCatalogProblems(search, difficulty, page, section ?? ""),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const totalLength = query.data?.totalLength ?? 0;
  const totalPages = totalLength > 0 ? Math.ceil(totalLength / CATALOG_PAGE_SIZE) : 0;

  return { ...query, totalLength, totalPages };
};

export const useFetchCatalogProblemDetail = (id?: string) => {
  return useQuery({
    queryKey: ["catalog", "problem", id],
    queryFn: () => fetchCatalogProblemDetail(id as string),
    enabled: !!id,
    // Keeps the previously loaded problem on screen while the next one loads (e.g. switching
    // which catalog problem the admin edit modal is open on), instead of flashing blank.
    placeholderData: keepPreviousData,
  });
};

// The caller's aggregate catalog progress (Practice tab's Progress-tab breakdown) - invalidated
// on every submit below since a submission can flip a problem from unsolved to solved.
export const useCatalogProgress = () => {
  return useQuery({
    queryKey: ["catalog", "progress"],
    queryFn: fetchCatalogProgress,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFetchSubmissions = (id?: string) => {
  return useQuery({
    queryKey: ["catalog", "submissions", id],
    queryFn: () => fetchSubmissions(id as string),
    enabled: !!id,
  });
};

export const useSubmitSolution = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceCode, language }: RunOrSubmitInput) =>
      submitSolution(id, sourceCode, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "progress"] });
      queryClient.invalidateQueries({ queryKey: ["dsa", "activity-heatmap"] });
    },
  });
};

// Doesn't persist a submission row, so there's nothing to invalidate.
export const useRunSolution = (id: string) => {
  return useMutation({
    mutationFn: ({ sourceCode, language }: RunOrSubmitInput) => runSolution(id, sourceCode, language),
  });
};

// Admin-only: (re)generate a catalog problem's test cases for review. Doesn't persist anything
// itself, so nothing to invalidate — the admin form saves the reviewed result via a normal
// updateCatalogProblem call.
export const useGenerateTestCases = (id: string) => {
  return useMutation({
    mutationFn: ({
      referenceSolution,
      referenceSolutionLanguage,
      referenceSolutionReturnType,
    }: GenerateTestCasesInput) =>
      generateTestCases(
        id,
        referenceSolution,
        referenceSolutionLanguage,
        referenceSolutionReturnType
      ),
  });
};
