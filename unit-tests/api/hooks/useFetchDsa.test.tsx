jest.mock("../../../src/api/services/dsa.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useDsaActivityHeatmap,
  useFetchDsaProblemByUser,
  useFetchDsaProgress,
} from "../../../src/api/hooks/useFetchDsa";
import {
  fetchActivityHeatmap,
  fetchDsaByUser,
  fetchDsaProgress,
} from "../../../src/api/services/dsa.service";
import type { DSAProblem } from "../../../src/data/dsaProblemsData";
import type { DailyActivity } from "../../../src/data/dsaProblemsData";

const mockedFetchDsaByUser = fetchDsaByUser as jest.MockedFunction<typeof fetchDsaByUser>;
const mockedFetchDsaProgress = fetchDsaProgress as jest.MockedFunction<typeof fetchDsaProgress>;
const mockedFetchActivityHeatmap = fetchActivityHeatmap as jest.MockedFunction<
  typeof fetchActivityHeatmap
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

describe("useDsaActivityHeatmap", () => {
  const activityDay = (date: string, overrides: Partial<DailyActivity> = {}): DailyActivity => ({
    date,
    catalogSubmissions: 0,
    catalogAccepted: 0,
    curriculumSubmissions: 0,
    curriculumAccepted: 0,
    ...overrides,
  });

  test("registers queryKey ['dsa', 'activity-heatmap', 'trailing'] and calls the service with no year when omitted", async () => {
    mockedFetchActivityHeatmap.mockResolvedValue([activityDay("2026-09-24")]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useDsaActivityHeatmap(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchActivityHeatmap).toHaveBeenCalledWith(undefined);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["dsa", "activity-heatmap", "trailing"]);
  });

  test("registers queryKey ['dsa', 'activity-heatmap', year] and passes the year through when given", async () => {
    mockedFetchActivityHeatmap.mockResolvedValue([activityDay("2025-06-01")]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useDsaActivityHeatmap(2025), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchActivityHeatmap).toHaveBeenCalledWith(2025);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["dsa", "activity-heatmap", 2025]);
  });

  test("returns the service's array as-is (server-computed, no client-side bucketing)", async () => {
    const payload = [
      activityDay("2026-09-23", { catalogAccepted: 1 }),
      activityDay("2026-09-24", { curriculumAccepted: 2, curriculumSubmissions: 3 }),
    ];
    mockedFetchActivityHeatmap.mockResolvedValue(payload);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDsaActivityHeatmap(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(payload);
  });
});
