jest.mock("../../../src/api/services/language.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFetchLanguage, useAddLanguage } from "../../../src/api/hooks/useFetchLanguage";
import { addLanguage, fetchLanguage } from "../../../src/api/services/language.service";

const mockedFetchLanguage = fetchLanguage as jest.MockedFunction<typeof fetchLanguage>;
const mockedAddLanguage = addLanguage as jest.MockedFunction<typeof addLanguage>;

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

describe("useFetchLanguage", () => {
  test("registers queryKey ['language'] and calls the service with no arguments", async () => {
    mockedFetchLanguage.mockResolvedValue([{ id: "l1", language: "Python" }]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchLanguage(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchLanguage).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["language"]);
  });

  test("surfaces the languages returned by the service", async () => {
    mockedFetchLanguage.mockResolvedValue([{ id: "l1", language: "Python" }]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchLanguage(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "l1", language: "Python" }]);
  });
});

describe("useAddLanguage", () => {
  test("passes the mutate() argument straight through to addLanguage (mutationFn = addLanguage, unwrapped)", async () => {
    mockedAddLanguage.mockResolvedValue({ id: "l2", language: "Rust" });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAddLanguage(), { wrapper: Wrapper });
    act(() => result.current.mutate("Rust"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // mutationFn is `addLanguage` itself (not wrapped in an arrow fn), so React Query calls it
    // with (variables, context) — assert the first argument, the one the caller controls.
    expect(mockedAddLanguage.mock.calls[0][0]).toBe("Rust");
  });

  test("onSuccess invalidates exactly ['language'] (singular), matching useFetchLanguage's own key", async () => {
    mockedAddLanguage.mockResolvedValue({ id: "l2", language: "Rust" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddLanguage(), { wrapper: Wrapper });
    act(() => result.current.mutate("Rust"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["language"] });
  });

  test("the invalidation actually reaches useFetchLanguage's cached data (not a mismatched 'languages' key)", async () => {
    mockedAddLanguage.mockResolvedValue({ id: "l2", language: "Rust" });
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["language"], [{ id: "l1", language: "Python" }]);

    const { result } = renderHook(() => useAddLanguage(), { wrapper: Wrapper });
    act(() => result.current.mutate("Rust"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["language"])?.isInvalidated).toBe(true);
  });
});
