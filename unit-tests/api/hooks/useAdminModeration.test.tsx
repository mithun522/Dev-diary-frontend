jest.mock("../../../src/api/services/adminModeration.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  ADMIN_MATERIALS_QUERY_KEY,
  useFetchAdminMaterials,
  useAdminDeleteBlog,
  useAdminDeleteMaterial,
} from "../../../src/api/hooks/useAdminModeration";
import {
  fetchAllMaterials,
  adminDeleteBlog,
  adminDeleteMaterial,
  type AdminMaterial,
} from "../../../src/api/services/adminModeration.service";

const mockedFetchAllMaterials = fetchAllMaterials as jest.MockedFunction<
  typeof fetchAllMaterials
>;
const mockedAdminDeleteBlog = adminDeleteBlog as jest.MockedFunction<typeof adminDeleteBlog>;
const mockedAdminDeleteMaterial = adminDeleteMaterial as jest.MockedFunction<
  typeof adminDeleteMaterial
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

const material: AdminMaterial = {
  id: "m1",
  fileName: "notes.pdf",
  fileType: "application/pdf",
  fileSizeBytes: 1024,
  downloadUrl: "https://example.com/notes.pdf",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ADMIN_MATERIALS_QUERY_KEY", () => {
  test("is ['admin', 'materials']", () => {
    expect(ADMIN_MATERIALS_QUERY_KEY).toEqual(["admin", "materials"]);
  });
});

describe("useFetchAdminMaterials", () => {
  test("registers ADMIN_MATERIALS_QUERY_KEY as its query key", async () => {
    mockedFetchAllMaterials.mockResolvedValue([material]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminMaterials(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(
      ADMIN_MATERIALS_QUERY_KEY
    );
    expect(result.current.data).toEqual([material]);
  });
});

describe("useAdminDeleteBlog", () => {
  test("calls adminDeleteBlog(id) and invalidates the ['blogs'] key on success", async () => {
    mockedAdminDeleteBlog.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAdminDeleteBlog(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("b1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // mutationFn is adminDeleteBlog itself (not wrapped), so react-query also passes its mutation
    // context as a 2nd argument.
    expect(mockedAdminDeleteBlog).toHaveBeenCalledWith("b1", expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["blogs"] });
  });
});

describe("useAdminDeleteMaterial", () => {
  test("calls adminDeleteMaterial(id) and invalidates ADMIN_MATERIALS_QUERY_KEY on success", async () => {
    mockedAdminDeleteMaterial.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAdminDeleteMaterial(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("m1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAdminDeleteMaterial).toHaveBeenCalledWith("m1", expect.anything());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ADMIN_MATERIALS_QUERY_KEY });
  });

  test("does not invalidate the blogs key (each delete mutation only touches its own resource)", async () => {
    mockedAdminDeleteMaterial.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAdminDeleteMaterial(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("m1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["blogs"] });
  });
});
