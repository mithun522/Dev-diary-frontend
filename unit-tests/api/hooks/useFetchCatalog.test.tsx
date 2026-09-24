jest.mock("../../../src/api/services/catalog.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useFetchCatalogProblems,
  useFetchCatalogProblemsPaged,
  useFetchCatalogProblemDetail,
  useFetchSubmissions,
  useSubmitSolution,
  useRunSolution,
  useGenerateTestCases,
} from "../../../src/api/hooks/useFetchCatalog";
import {
  fetchCatalogProblems,
  fetchCatalogProblemDetail,
  fetchSubmissions,
  submitSolution,
  runSolution,
  generateTestCases,
} from "../../../src/api/services/catalog.service";
import type { CatalogProblem, CatalogProblemPage } from "../../../src/data/catalogData";

const mockedFetchCatalogProblems = fetchCatalogProblems as jest.MockedFunction<
  typeof fetchCatalogProblems
>;
const mockedFetchCatalogProblemDetail = fetchCatalogProblemDetail as jest.MockedFunction<
  typeof fetchCatalogProblemDetail
>;
const mockedFetchSubmissions = fetchSubmissions as jest.MockedFunction<typeof fetchSubmissions>;
const mockedSubmitSolution = submitSolution as jest.MockedFunction<typeof submitSolution>;
const mockedRunSolution = runSolution as jest.MockedFunction<typeof runSolution>;
const mockedGenerateTestCases = generateTestCases as jest.MockedFunction<typeof generateTestCases>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const problem = (id: string): CatalogProblem => ({
  id,
  slug: `slug-${id}`,
  title: `Title ${id}`,
  difficulty: "EASY",
  topics: [],
  description: "desc",
  functionName: "fn",
  paramNames: [],
  starterCode: {},
  section: null,
  position: null,
  timeLimitMs: null,
});

const page = (problems: CatalogProblem[], totalLength: number): CatalogProblemPage => ({
  problems,
  totalLength,
});

beforeEach(() => {
  jest.clearAllMocks();
});

// AdminCatalogTable (doc 17) still uses this "Load More" infinite-query hook, unchanged.
describe("useFetchCatalogProblems (infinite-query / Load More - AdminCatalogTable)", () => {
  test("registers the queryKey with the search/difficulty normalized via ?? defaults", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchCatalogProblems({ search: "two sum", difficulty: "EASY" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "two sum", "EASY"]);
    });
  });

  test("an empty-string difficulty is embedded as-is (?? only guards null/undefined, not '')", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchCatalogProblems({ search: "", difficulty: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "", ""]);
    });
  });

  test("normalizes a nullish difficulty to the literal 'NONE' in the queryKey", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(
      () =>
        useFetchCatalogProblems({
          search: "",
          difficulty: undefined as unknown as string,
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "", "NONE"]);
    });
  });

  test("calls the service with the search/difficulty and page number", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([problem("p1")], 1));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchCatalogProblems({ search: "sum", difficulty: "HARD" }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchCatalogProblems).toHaveBeenCalledWith("sum", "HARD", 1);
  });

  test("getNextPageParam returns the next page number while problems remain", async () => {
    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p1"), problem("p2")], 3));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchCatalogProblems({ search: "", difficulty: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // 2 loaded out of 3 total -> more remain, so a next page param must exist.
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p3")], 3));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(mockedFetchCatalogProblems).toHaveBeenLastCalledWith("", "", 2);
  });

  test("getNextPageParam returns undefined at the exact boundary where every problem is loaded", async () => {
    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p1"), problem("p2")], 3));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchCatalogProblems({ search: "", difficulty: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p3")], 3));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    // Exactly 3 of 3 loaded now -> the boundary -> no further page param.
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});

// PracticeTab (candidate-facing catalog browse) uses this numbered-pagination hook instead.
describe("useFetchCatalogProblemsPaged (numbered pagination - PracticeTab)", () => {
  test("registers the queryKey with search/difficulty/section normalized via ?? defaults, plus the page number", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(
      () => useFetchCatalogProblemsPaged({ search: "two sum", difficulty: "EASY", page: 1 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "two sum", "EASY", "NONE", 1]);
    });
  });

  test("an empty-string difficulty/section is embedded as-is (?? only guards null/undefined, not '')", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(
      () => useFetchCatalogProblemsPaged({ search: "", difficulty: "", section: "", page: 1 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "", "", "", 1]);
    });
  });

  test("normalizes a nullish difficulty/section to the literal 'NONE' in the queryKey", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { queryClient, Wrapper } = createWrapper();

    renderHook(
      () =>
        useFetchCatalogProblemsPaged({
          search: "",
          difficulty: undefined as unknown as string,
          page: 1,
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["catalog", "", "NONE", "NONE", 1]);
    });
  });

  test("calls the service with search, difficulty, page number, and section", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([problem("p1")], 1));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () =>
        useFetchCatalogProblemsPaged({
          search: "sum",
          difficulty: "HARD",
          section: "Arrays",
          page: 1,
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchCatalogProblems).toHaveBeenCalledWith("sum", "HARD", 1, "Arrays");
  });

  test("changing `page` triggers a new fetch for that page number", async () => {
    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p1")], 25));
    const { Wrapper } = createWrapper();

    const { result, rerender } = renderHook(
      ({ page }) => useFetchCatalogProblemsPaged({ search: "", difficulty: "", page }),
      { wrapper: Wrapper, initialProps: { page: 1 } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    mockedFetchCatalogProblems.mockResolvedValueOnce(page([problem("p11")], 25));
    rerender({ page: 2 });

    await waitFor(() =>
      expect(mockedFetchCatalogProblems).toHaveBeenLastCalledWith("", "", 2, "")
    );
  });

  test("totalPages is ceil(totalLength / CATALOG_PAGE_SIZE), e.g. 25 problems at 10/page -> 3 pages", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([problem("p1")], 25));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchCatalogProblemsPaged({ search: "", difficulty: "", page: 1 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.totalPages).toBe(3);
  });

  test("totalPages is 0 when there are no results (Pagination renders nothing)", async () => {
    mockedFetchCatalogProblems.mockResolvedValue(page([], 0));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchCatalogProblemsPaged({ search: "", difficulty: "", page: 1 }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.totalPages).toBe(0);
  });
});

describe("useFetchCatalogProblemDetail", () => {
  test("registers queryKey ['catalog', 'problem', id] and calls the service with the id", async () => {
    mockedFetchCatalogProblemDetail.mockResolvedValue({
      ...problem("p1"),
      sampleTestCases: [],
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchCatalogProblemDetail("p1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchCatalogProblemDetail).toHaveBeenCalledWith("p1");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["catalog", "problem", "p1"]);
  });

  test("is disabled (never calls the service) when no id is given", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useFetchCatalogProblemDetail(undefined), {
      wrapper: Wrapper,
    });

    // Give any pending microtask a chance to run.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedFetchCatalogProblemDetail).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useFetchSubmissions", () => {
  test("registers queryKey ['catalog', 'submissions', id] and calls the service with the id", async () => {
    mockedFetchSubmissions.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchSubmissions("p1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchSubmissions).toHaveBeenCalledWith("p1");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["catalog", "submissions", "p1"]);
  });

  test("is disabled (never calls the service) when no id is given", async () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useFetchSubmissions(undefined), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedFetchSubmissions).not.toHaveBeenCalled();
  });
});

describe("useSubmitSolution", () => {
  test("calls submitSolution with the id, sourceCode and language", async () => {
    mockedSubmitSolution.mockResolvedValue({
      id: "s1",
      problemId: "p1",
      sourceCode: "code",
      language: "python",
      createdAt: "2024-01-01",
      status: "ACCEPTED",
      results: [],
      runtimeMs: 1,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSubmitSolution("p1"), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ sourceCode: "code", language: "python" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSubmitSolution).toHaveBeenCalledWith("p1", "code", "python");
  });

  test("onSuccess invalidates exactly ['catalog', 'submissions', id]", async () => {
    mockedSubmitSolution.mockResolvedValue({
      id: "s1",
      problemId: "p1",
      sourceCode: "code",
      language: "python",
      createdAt: "2024-01-01",
      status: "WRONG_ANSWER",
      results: [],
      runtimeMs: 1,
    });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSubmitSolution("p1"), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ sourceCode: "code", language: "python" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["catalog", "submissions", "p1"] });
  });
});

describe("useRunSolution", () => {
  test("calls runSolution with the id, sourceCode and language and invalidates nothing", async () => {
    mockedRunSolution.mockResolvedValue({ status: "ACCEPTED", results: [], runtimeMs: 5 });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRunSolution("p1"), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ sourceCode: "code", language: "java" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedRunSolution).toHaveBeenCalledWith("p1", "code", "java");
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useGenerateTestCases", () => {
  test("calls generateTestCases with the reference solution, its language and optional return type", async () => {
    mockedGenerateTestCases.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useGenerateTestCases("p1"), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({
        referenceSolution: "int f(){}",
        referenceSolutionLanguage: "cpp",
        referenceSolutionReturnType: "int",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGenerateTestCases).toHaveBeenCalledWith("p1", "int f(){}", "cpp", "int");
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
