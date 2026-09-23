jest.mock("../../../src/api/services/techInterview.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useFetchTechInterview,
  useFetchTechInterviewLength,
  useSearchTechInterview,
} from "../../../src/api/hooks/useFetchTechInterview";
import {
  getTechInterviewByLanguage,
  searchTechInterview,
} from "../../../src/api/services/techInterview.service";

const mockedGetTechInterviewByLanguage =
  getTechInterviewByLanguage as jest.MockedFunction<typeof getTechInterviewByLanguage>;
const mockedSearchTechInterview =
  searchTechInterview as jest.MockedFunction<typeof searchTechInterview>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const question = (id: string) => ({
  id,
  question: `question ${id}`,
  answer: "answer",
  notes: "",
  language: "javascript",
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchTechInterview", () => {
  test("registers the ['techInterview', language] query key", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValue({
      techInterview: [],
      techInterviewTotalLength: 0,
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterview("javascript"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const queries = queryClient.getQueryCache().findAll();
    expect(queries).toHaveLength(1);
    expect(queries[0].queryKey).toEqual(["techInterview", "javascript"]);
  });

  test("fetches page 1 first, calling the service with (language, pageParam)", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValue({
      techInterview: [question("q1")],
      techInterviewTotalLength: 1,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterview("python"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetTechInterviewByLanguage).toHaveBeenCalledWith("python", 1);
    expect(result.current.data?.pages[0]).toEqual({
      questions: [question("q1")],
      total: 1,
      page: 1,
    });
  });

  test("getNextPageParam requests page 2 while more results remain", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValueOnce({
      techInterview: [question("q1"), question("q2")],
      techInterviewTotalLength: 3,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterview("go"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedGetTechInterviewByLanguage.mockResolvedValueOnce({
      techInterview: [question("q3")],
      techInterviewTotalLength: 3,
    });

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));

    expect(mockedGetTechInterviewByLanguage).toHaveBeenLastCalledWith("go", 2);
    // 3 of 3 loaded now: exactly at the boundary, so no further page is offered.
    expect(result.current.hasNextPage).toBe(false);
  });

  test("getNextPageParam is undefined once every result has been loaded on page 1", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValue({
      techInterview: [question("q1")],
      techInterviewTotalLength: 1,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterview("rust"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useFetchTechInterviewLength", () => {
  test("registers the ['techInterviewLength', language] query key", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValue({
      techInterview: [],
      techInterviewTotalLength: 7,
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterviewLength("java"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "techInterviewLength",
      "java",
    ]);
  });

  test("calls the service with page 1 and returns just the total length", async () => {
    mockedGetTechInterviewByLanguage.mockResolvedValue({
      techInterview: [question("q1"), question("q2")],
      techInterviewTotalLength: 42,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchTechInterviewLength("java"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedGetTechInterviewByLanguage).toHaveBeenCalledWith("java", 1);
    expect(result.current.data).toBe(42);
  });
});

describe("useSearchTechInterview", () => {
  test("registers the ['searchTechInterview', searchQuery, language] query key", async () => {
    mockedSearchTechInterview.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useSearchTechInterview("closures", "javascript"),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "searchTechInterview",
      "closures",
      "javascript",
    ]);
  });

  test("does not call the service when the search query is empty", () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSearchTechInterview("", "javascript"), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedSearchTechInterview).not.toHaveBeenCalled();
  });

  test("does not call the service when the search query is only whitespace", () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSearchTechInterview("   ", "javascript"), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedSearchTechInterview).not.toHaveBeenCalled();
  });

  test("calls the service with (searchQuery, language) once enabled", async () => {
    mockedSearchTechInterview.mockResolvedValue([question("q1")]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useSearchTechInterview("closures", "javascript"),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedSearchTechInterview).toHaveBeenCalledWith("closures", "javascript");
    expect(result.current.data).toEqual([question("q1")]);
  });
});
