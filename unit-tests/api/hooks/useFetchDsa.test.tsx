jest.mock("../../../src/api/services/dsa.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useFetchDsaProblemByUser,
  useFetchDsaProgress,
  useFetchDsaWeeklyActivity,
} from "../../../src/api/hooks/useFetchDsa";
import { fetchDsaByUser, fetchDsaProgress } from "../../../src/api/services/dsa.service";
import { computeWeeklyActivity } from "../../../src/utils/computeWeeklyActivity";
import type { DSAProblem } from "../../../src/data/dsaProblemsData";

const mockedFetchDsaByUser = fetchDsaByUser as jest.MockedFunction<typeof fetchDsaByUser>;
const mockedFetchDsaProgress = fetchDsaProgress as jest.MockedFunction<typeof fetchDsaProgress>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const dsaProblem = (id: string, overrides: Partial<DSAProblem> = {}): DSAProblem => ({
  id,
  problem: `Problem ${id}`,
  difficulty: "EASY",
  language: "JAVASCRIPT",
  topics: [],
  link: "https://example.com",
  status: "SOLVED",
  updatedAt: new Date().toISOString(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchDsaProblemByUser", () => {
  test("registers the queryKey with search/difficulty normalized via ?? defaults", async () => {
    mockedFetchDsaByUser.mockResolvedValue({ dsa: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchDsaProblemByUser({ search: "binary", difficulty: "HARD" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["dsa", "binary", "HARD"]);
    });
  });

  test("normalizes a nullish difficulty to the literal 'NONE' in the queryKey", async () => {
    mockedFetchDsaByUser.mockResolvedValue({ dsa: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(
      () =>
        useFetchDsaProblemByUser({
          search: "",
          difficulty: undefined as unknown as string,
        }),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["dsa", "", "NONE"]);
    });
  });

  test("calls the service with the search/difficulty and page number", async () => {
    mockedFetchDsaByUser.mockResolvedValue({ dsa: [dsaProblem("d1")], totalLength: 1 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchDsaProblemByUser({ search: "dp", difficulty: "MEDIUM" }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchDsaByUser).toHaveBeenCalledWith("dp", "MEDIUM", 1);
  });

  test("getNextPageParam returns the next page number while problems remain", async () => {
    mockedFetchDsaByUser.mockResolvedValueOnce({
      dsa: [dsaProblem("d1"), dsaProblem("d2")],
      totalLength: 3,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaProblemByUser({ search: "", difficulty: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchDsaByUser.mockResolvedValueOnce({ dsa: [dsaProblem("d3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(mockedFetchDsaByUser).toHaveBeenLastCalledWith("", "", 2);
  });

  test("getNextPageParam returns undefined at the exact boundary where every problem is loaded", async () => {
    mockedFetchDsaByUser.mockResolvedValueOnce({
      dsa: [dsaProblem("d1"), dsaProblem("d2")],
      totalLength: 3,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaProblemByUser({ search: "", difficulty: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchDsaByUser.mockResolvedValueOnce({ dsa: [dsaProblem("d3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});

describe("useFetchDsaProgress", () => {
  test("registers queryKey ['dsa'] and calls the service with no args", async () => {
    mockedFetchDsaProgress.mockResolvedValue({ data: [{ date: "2024-01-01", problemsSolved: 2 }] });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaProgress(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchDsaProgress).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["dsa"]);
  });

  test("unwraps response.data — returns the array itself, not the axios response envelope", async () => {
    const payload = [{ date: "2024-01-01", problemsSolved: 2 }];
    mockedFetchDsaProgress.mockResolvedValue({ data: payload });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaProgress(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(payload);
  });
});

describe("useFetchDsaWeeklyActivity", () => {
  test("registers queryKey ['dsa', 'weekly-activity'] prefixed with 'dsa' so add/edit/delete invalidation reaches it", async () => {
    mockedFetchDsaByUser.mockResolvedValue({ dsa: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaWeeklyActivity(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["dsa", "weekly-activity"]);
  });

  test("fetches only page 1 when the first page already contains every problem", async () => {
    mockedFetchDsaByUser.mockResolvedValue({
      dsa: [dsaProblem("d1"), dsaProblem("d2")],
      totalLength: 2,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaWeeklyActivity(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchDsaByUser).toHaveBeenCalledTimes(1);
    expect(mockedFetchDsaByUser).toHaveBeenCalledWith("", "", 1);
  });

  test("fetches every remaining page (unfiltered) and feeds the full concatenated set to computeWeeklyActivity", async () => {
    // pageSize 2, totalLength 5 -> totalPages = ceil(5/2) = 3 -> fetches pages 2 and 3 as well.
    const page1 = [dsaProblem("d1"), dsaProblem("d2")];
    const page2 = [dsaProblem("d3"), dsaProblem("d4")];
    const page3 = [dsaProblem("d5")];
    mockedFetchDsaByUser.mockImplementation(async (_search, _difficulty, pageParam) => {
      if (pageParam === 1) return { dsa: page1, totalLength: 5 };
      if (pageParam === 2) return { dsa: page2, totalLength: 5 };
      return { dsa: page3, totalLength: 5 };
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaWeeklyActivity(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchDsaByUser).toHaveBeenCalledTimes(3);
    expect(mockedFetchDsaByUser).toHaveBeenCalledWith("", "", 1);
    expect(mockedFetchDsaByUser).toHaveBeenCalledWith("", "", 2);
    expect(mockedFetchDsaByUser).toHaveBeenCalledWith("", "", 3);

    // Real computeWeeklyActivity (not mocked) run against the full concatenated set is the
    // source of truth — proves the hook actually assembled every page before bucketing, not
    // just page 1.
    const expected = computeWeeklyActivity([...page1, ...page2, ...page3]);
    expect(result.current.data).toEqual(expected);
  });

  test("does not divide by a zero pageSize when the first page is empty but totalLength is > 0", async () => {
    mockedFetchDsaByUser.mockResolvedValue({ dsa: [], totalLength: 5 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaWeeklyActivity(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Guarded by `pageSize > 0` — only the first (empty) page is ever fetched.
    expect(mockedFetchDsaByUser).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(computeWeeklyActivity([]));
  });
});
