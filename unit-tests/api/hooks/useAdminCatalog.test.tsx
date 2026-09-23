jest.mock("../../../src/api/services/adminCatalog.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCreateCatalogProblem,
  useUpdateCatalogProblem,
  useDeleteCatalogProblem,
} from "../../../src/api/hooks/useAdminCatalog";
import {
  createCatalogProblem,
  deleteCatalogProblem,
  updateCatalogProblem,
  type CatalogProblemInputPayload,
} from "../../../src/api/services/adminCatalog.service";
import type { CatalogProblemDetail } from "../../../src/data/catalogData";

const mockedCreateCatalogProblem = createCatalogProblem as jest.MockedFunction<
  typeof createCatalogProblem
>;
const mockedUpdateCatalogProblem = updateCatalogProblem as jest.MockedFunction<
  typeof updateCatalogProblem
>;
const mockedDeleteCatalogProblem = deleteCatalogProblem as jest.MockedFunction<
  typeof deleteCatalogProblem
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

const payload: CatalogProblemInputPayload = {
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  topics: [],
  description: "desc",
  functionName: "twoSum",
  paramNames: ["nums", "target"],
  starterCode: { javascript: "function twoSum() {}" },
  testCases: [{ args: [], expected: 0, isSample: true }],
};

const detail: CatalogProblemDetail = {
  id: "p1",
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  topics: [],
  description: "desc",
  functionName: "twoSum",
  paramNames: ["nums", "target"],
  starterCode: { javascript: "function twoSum() {}" },
  section: null,
  position: null,
  timeLimitMs: null,
  sampleTestCases: [],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCreateCatalogProblem", () => {
  test("calls the service with the payload and invalidates exactly ['catalog']", async () => {
    mockedCreateCatalogProblem.mockResolvedValue(detail);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCatalogProblem(), { wrapper: Wrapper });
    act(() => result.current.mutate(payload));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedCreateCatalogProblem).toHaveBeenCalledWith(payload);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["catalog"] });
  });
});

describe("useUpdateCatalogProblem", () => {
  test("calls the service with id+payload and invalidates exactly ['catalog']", async () => {
    mockedUpdateCatalogProblem.mockResolvedValue(detail);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCatalogProblem(), { wrapper: Wrapper });
    act(() => result.current.mutate({ id: "p1", payload }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUpdateCatalogProblem).toHaveBeenCalledWith("p1", payload);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["catalog"] });
  });
});

describe("useDeleteCatalogProblem", () => {
  test("calls the service with the id and invalidates exactly ['catalog']", async () => {
    mockedDeleteCatalogProblem.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCatalogProblem(), { wrapper: Wrapper });
    act(() => result.current.mutate("p1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedDeleteCatalogProblem).toHaveBeenCalledWith("p1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["catalog"] });
  });
});

describe("cache invalidation reaches every 'catalog'-prefixed key (partial match, per the hook's own comment)", () => {
  test("invalidating ['catalog'] marks the list, a problem detail, and its submissions all stale at once", async () => {
    mockedDeleteCatalogProblem.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["catalog", "", "NONE"], { problems: [], totalLength: 0 });
    queryClient.setQueryData(["catalog", "problem", "p1"], detail);
    queryClient.setQueryData(["catalog", "submissions", "p1"], []);

    const { result } = renderHook(() => useDeleteCatalogProblem(), { wrapper: Wrapper });
    act(() => result.current.mutate("p1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["catalog", "", "NONE"])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["catalog", "problem", "p1"])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["catalog", "submissions", "p1"])?.isInvalidated).toBe(true);
  });

  test("does not touch an unrelated top-level key such as ['curriculum-topics']", async () => {
    mockedCreateCatalogProblem.mockResolvedValue(detail);
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["curriculum-topics"], []);

    const { result } = renderHook(() => useCreateCatalogProblem(), { wrapper: Wrapper });
    act(() => result.current.mutate(payload));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["curriculum-topics"])?.isInvalidated).toBe(false);
  });
});
