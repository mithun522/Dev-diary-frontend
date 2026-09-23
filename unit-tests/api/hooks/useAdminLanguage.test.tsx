jest.mock("../../../src/api/services/adminLanguage.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useUpdateLanguage,
  useDeleteLanguage,
} from "../../../src/api/hooks/useAdminLanguage";
import {
  updateLanguage,
  deleteLanguage,
} from "../../../src/api/services/adminLanguage.service";

const mockedUpdateLanguage = updateLanguage as jest.MockedFunction<typeof updateLanguage>;
const mockedDeleteLanguage = deleteLanguage as jest.MockedFunction<typeof deleteLanguage>;

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

describe("useUpdateLanguage", () => {
  test("calls updateLanguage(id, language) with the mutation input", async () => {
    mockedUpdateLanguage.mockResolvedValue({ id: "l1", language: "Go" });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateLanguage(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "l1", language: "Go" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateLanguage).toHaveBeenCalledWith("l1", "Go");
  });

  test("invalidates the ['language'] query key on success, matching useFetchLanguage's key", async () => {
    mockedUpdateLanguage.mockResolvedValue({ id: "l1", language: "Go" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateLanguage(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "l1", language: "Go" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["language"] });
  });

  test("does not invalidate anything when the mutation fails", async () => {
    mockedUpdateLanguage.mockRejectedValue(new Error("Forbidden"));
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateLanguage(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "l1", language: "Go" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useDeleteLanguage", () => {
  test("calls deleteLanguage(id) with the mutation input", async () => {
    mockedDeleteLanguage.mockResolvedValue(undefined);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useDeleteLanguage(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("l1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteLanguage).toHaveBeenCalledWith("l1");
  });

  test("invalidates the ['language'] query key on success", async () => {
    mockedDeleteLanguage.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteLanguage(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("l1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["language"] });
  });
});
