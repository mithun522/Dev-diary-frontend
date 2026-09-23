jest.mock("../../../src/api/services/techInterviewCatalog.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useCatalogCategories,
  useCatalogStack,
  useCatalogQuestion,
  useSearchCatalogQuestions,
} from "../../../src/api/hooks/useTechInterviewCatalog";
import {
  fetchCatalogCategories,
  fetchCatalogStack,
  fetchCatalogQuestion,
  searchCatalogQuestions,
} from "../../../src/api/services/techInterviewCatalog.service";
import type { CatalogSearchPage } from "../../../src/data/techInterviewCatalogData";

const mockedFetchCatalogCategories =
  fetchCatalogCategories as jest.MockedFunction<typeof fetchCatalogCategories>;
const mockedFetchCatalogStack = fetchCatalogStack as jest.MockedFunction<
  typeof fetchCatalogStack
>;
const mockedFetchCatalogQuestion = fetchCatalogQuestion as jest.MockedFunction<
  typeof fetchCatalogQuestion
>;
const mockedSearchCatalogQuestions = searchCatalogQuestions as jest.MockedFunction<
  typeof searchCatalogQuestions
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCatalogCategories", () => {
  test("registers the plain ['tech-interview-catalog-categories'] query key", async () => {
    mockedFetchCatalogCategories.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCatalogCategories(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "tech-interview-catalog-categories",
    ]);
  });

  test("calls fetchCatalogCategories with no arguments and returns its data", async () => {
    const categories = [{ slug: "cloud", label: "Cloud", stacks: [] }];
    mockedFetchCatalogCategories.mockResolvedValue(categories);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCatalogCategories(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // queryFn is passed directly as fetchCatalogCategories (no wrapping arrow), so react-query
    // calls it with its QueryFunctionContext rather than no args at all.
    expect(mockedFetchCatalogCategories).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(categories);
  });
});

describe("useCatalogStack", () => {
  test("registers the ['tech-interview-catalog-stack', stack] query key", async () => {
    mockedFetchCatalogStack.mockResolvedValue({
      stack: "aws",
      label: "AWS",
      category: "cloud",
      categoryLabel: "Cloud",
      topics: [],
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCatalogStack("aws"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "tech-interview-catalog-stack",
      "aws",
    ]);
    expect(mockedFetchCatalogStack).toHaveBeenCalledWith("aws");
  });

  test("does not call the service when stack is empty (enabled: !!stack)", () => {
    const { result } = renderHook(() => useCatalogStack(""), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchCatalogStack).not.toHaveBeenCalled();
  });
});

describe("useCatalogQuestion", () => {
  test("registers the ['tech-interview-catalog-question', slug] query key", async () => {
    mockedFetchCatalogQuestion.mockResolvedValue({
      slug: "lambda-cold-start",
      question: "What causes a cold start?",
      difficulty: "INTERMEDIATE",
      category: "cloud",
      categoryLabel: "Cloud",
      stack: "aws",
      stackLabel: "AWS",
      topic: "lambda",
      topicTitle: "Lambda",
      answer: "...",
      notes: null,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCatalogQuestion("lambda-cold-start"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "tech-interview-catalog-question",
      "lambda-cold-start",
    ]);
    expect(mockedFetchCatalogQuestion).toHaveBeenCalledWith("lambda-cold-start");
  });

  test("does not call the service when slug is empty (enabled: !!slug)", () => {
    const { result } = renderHook(() => useCatalogQuestion(""), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchCatalogQuestion).not.toHaveBeenCalled();
  });
});

describe("useSearchCatalogQuestions", () => {
  const emptyPage: CatalogSearchPage = { results: [], totalLength: 0, page: 1, pageSize: 20 };

  test("normalizes undefined category/stack/difficulty to '' and undefined page to 1 in the query key", async () => {
    mockedSearchCatalogQuestions.mockResolvedValue(emptyPage);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useSearchCatalogQuestions({ q: "lambda" }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "tech-interview-catalog-search",
      "lambda",
      "",
      "",
      "",
      1,
    ]);
  });

  test("embeds every given filter param in the query key", async () => {
    mockedSearchCatalogQuestions.mockResolvedValue(emptyPage);
    const { queryClient, Wrapper } = createWrapper();

    const params = {
      q: "lambda",
      category: "cloud",
      stack: "aws",
      difficulty: "ADVANCED" as const,
      page: 3,
    };
    const { result } = renderHook(() => useSearchCatalogQuestions(params), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "tech-interview-catalog-search",
      "lambda",
      "cloud",
      "aws",
      "ADVANCED",
      3,
    ]);
    expect(mockedSearchCatalogQuestions).toHaveBeenCalledWith(params);
  });

  test("does not call the service when q is empty (enabled: q.trim().length > 0)", () => {
    const { result } = renderHook(() => useSearchCatalogQuestions({ q: "" }), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedSearchCatalogQuestions).not.toHaveBeenCalled();
  });

  test("does not call the service when q is only whitespace", () => {
    const { result } = renderHook(() => useSearchCatalogQuestions({ q: "   " }), {
      wrapper: createWrapper().Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedSearchCatalogQuestions).not.toHaveBeenCalled();
  });
});
