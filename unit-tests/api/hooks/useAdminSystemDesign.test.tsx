jest.mock("../../../src/api/services/adminSystemDesign.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  SYSTEM_DESIGN_CASES_QUERY_KEY,
  SCALABILITY_PATTERNS_QUERY_KEY,
  useFetchSystemDesignCases,
  useCreateCase,
  useUpdateCase,
  useDeleteCase,
  useFetchScalabilityPatterns,
  useCreatePattern,
  useUpdatePattern,
  useDeletePattern,
} from "../../../src/api/hooks/useAdminSystemDesign";
import {
  fetchSystemDesignCases,
  createCase,
  updateCase,
  deleteCase,
  fetchScalabilityPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  type CaseInput,
  type PatternInput,
  type ScalabilityPatternRecord,
  type SystemDesignCaseRecord,
} from "../../../src/api/services/adminSystemDesign.service";

const mockedFetchSystemDesignCases = fetchSystemDesignCases as jest.MockedFunction<
  typeof fetchSystemDesignCases
>;
const mockedCreateCase = createCase as jest.MockedFunction<typeof createCase>;
const mockedUpdateCase = updateCase as jest.MockedFunction<typeof updateCase>;
const mockedDeleteCase = deleteCase as jest.MockedFunction<typeof deleteCase>;
const mockedFetchScalabilityPatterns = fetchScalabilityPatterns as jest.MockedFunction<
  typeof fetchScalabilityPatterns
>;
const mockedCreatePattern = createPattern as jest.MockedFunction<typeof createPattern>;
const mockedUpdatePattern = updatePattern as jest.MockedFunction<typeof updatePattern>;
const mockedDeletePattern = deletePattern as jest.MockedFunction<typeof deletePattern>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const caseRecord: SystemDesignCaseRecord = {
  id: "c1",
  title: "Design a URL shortener",
  techStack: ["redis", "postgres"],
};

const caseInput: CaseInput = {
  title: "Design a URL shortener",
  techStack: ["redis", "postgres"],
};

const patternRecord: ScalabilityPatternRecord = {
  id: "p1",
  name: "Sharding",
  useCases: ["large datasets"],
  benefits: ["horizontal scale"],
};

const patternInput: PatternInput = {
  name: "Sharding",
  useCases: ["large datasets"],
  benefits: ["horizontal scale"],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("query keys", () => {
  test("SYSTEM_DESIGN_CASES_QUERY_KEY is ['system-design-cases']", () => {
    expect(SYSTEM_DESIGN_CASES_QUERY_KEY).toEqual(["system-design-cases"]);
  });

  test("SCALABILITY_PATTERNS_QUERY_KEY is ['system-design-patterns']", () => {
    expect(SCALABILITY_PATTERNS_QUERY_KEY).toEqual(["system-design-patterns"]);
  });
});

describe("useFetchSystemDesignCases", () => {
  test("registers SYSTEM_DESIGN_CASES_QUERY_KEY and calls fetchSystemDesignCases", async () => {
    mockedFetchSystemDesignCases.mockResolvedValue([caseRecord]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchSystemDesignCases(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(
      SYSTEM_DESIGN_CASES_QUERY_KEY
    );
    expect(result.current.data).toEqual([caseRecord]);
  });
});

describe("case mutations", () => {
  test("useCreateCase calls createCase(payload) and invalidates SYSTEM_DESIGN_CASES_QUERY_KEY", async () => {
    mockedCreateCase.mockResolvedValue(caseRecord);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCase(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate(caseInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateCase).toHaveBeenCalledWith(caseInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
  });

  test("useUpdateCase calls updateCase(id, payload) and invalidates SYSTEM_DESIGN_CASES_QUERY_KEY", async () => {
    mockedUpdateCase.mockResolvedValue(caseRecord);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCase(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "c1", payload: caseInput });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateCase).toHaveBeenCalledWith("c1", caseInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
  });

  test("useDeleteCase calls deleteCase(id) and invalidates SYSTEM_DESIGN_CASES_QUERY_KEY", async () => {
    mockedDeleteCase.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCase(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("c1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteCase).toHaveBeenCalledWith("c1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
  });
});

describe("useFetchScalabilityPatterns", () => {
  test("registers SCALABILITY_PATTERNS_QUERY_KEY and calls fetchScalabilityPatterns", async () => {
    mockedFetchScalabilityPatterns.mockResolvedValue([patternRecord]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchScalabilityPatterns(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(
      SCALABILITY_PATTERNS_QUERY_KEY
    );
    expect(result.current.data).toEqual([patternRecord]);
  });
});

describe("pattern mutations", () => {
  test("useCreatePattern calls createPattern(payload) and invalidates SCALABILITY_PATTERNS_QUERY_KEY", async () => {
    mockedCreatePattern.mockResolvedValue(patternRecord);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreatePattern(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate(patternInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreatePattern).toHaveBeenCalledWith(patternInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SCALABILITY_PATTERNS_QUERY_KEY });
  });

  test("useUpdatePattern calls updatePattern(id, payload) and invalidates SCALABILITY_PATTERNS_QUERY_KEY", async () => {
    mockedUpdatePattern.mockResolvedValue(patternRecord);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdatePattern(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "p1", payload: patternInput });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdatePattern).toHaveBeenCalledWith("p1", patternInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SCALABILITY_PATTERNS_QUERY_KEY });
  });

  test("useDeletePattern calls deletePattern(id) and invalidates SCALABILITY_PATTERNS_QUERY_KEY", async () => {
    mockedDeletePattern.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeletePattern(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("p1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeletePattern).toHaveBeenCalledWith("p1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SCALABILITY_PATTERNS_QUERY_KEY });
  });

  test("a pattern mutation never invalidates the unrelated system-design-cases key", async () => {
    mockedDeletePattern.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeletePattern(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("p1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
  });
});
