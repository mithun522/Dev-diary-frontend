jest.mock("../../../src/api/services/dsaTodo.service");

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  DSA_TODOS_QUERY_KEY,
  useFetchDsaTodos,
} from "../../../src/api/hooks/useFetchDsaTodo";
import { fetchDsaTodos } from "../../../src/api/services/dsaTodo.service";
import type { DsaTodo } from "../../../src/data/dsaTodoData";

const mockedFetchDsaTodos = fetchDsaTodos as jest.MockedFunction<typeof fetchDsaTodos>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const todo: DsaTodo = { id: "t1", problem: "Two Sum", priority: "HIGH", isDone: false };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchDsaTodos", () => {
  test("the exported DSA_TODOS_QUERY_KEY is exactly what the hook registers in the cache", async () => {
    mockedFetchDsaTodos.mockResolvedValue([todo]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaTodos(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Reading through the exported constant proves it hasn't drifted from the hook's own
    // internal queryKey — a caller invalidating via DSA_TODOS_QUERY_KEY must hit this data.
    expect(queryClient.getQueryData(DSA_TODOS_QUERY_KEY)).toEqual([todo]);
    expect(DSA_TODOS_QUERY_KEY).toEqual(["dsaTodos"]);
  });

  test("calls fetchDsaTodos with no arguments", async () => {
    mockedFetchDsaTodos.mockResolvedValue([]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaTodos(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchDsaTodos).toHaveBeenCalledTimes(1);
  });

  test("surfaces the todos array returned by the service", async () => {
    mockedFetchDsaTodos.mockResolvedValue([todo]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaTodos(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([todo]);
  });

  test("surfaces a rejected fetch as an error state rather than swallowing it", async () => {
    mockedFetchDsaTodos.mockRejectedValue(new Error("Network Error"));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchDsaTodos(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("Network Error"));
  });
});
