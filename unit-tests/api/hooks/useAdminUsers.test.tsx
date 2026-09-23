jest.mock("../../../src/api/services/adminUsers.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useFetchAdminUsers,
  useUpdateUserRole,
} from "../../../src/api/hooks/useAdminUsers";
import {
  fetchAdminUsers,
  updateUserRole,
} from "../../../src/api/services/adminUsers.service";
import type { AdminUser, AdminUserPage } from "../../../src/data/adminData";

const mockedFetchAdminUsers = fetchAdminUsers as jest.MockedFunction<typeof fetchAdminUsers>;
const mockedUpdateUserRole = updateUserRole as jest.MockedFunction<typeof updateUserRole>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const user = (id: string, role: AdminUser["role"] = "user"): AdminUser => ({
  id,
  email: `${id}@example.com`,
  firstName: "A",
  lastName: "B",
  role,
  createdAt: "2024-01-01T00:00:00Z",
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchAdminUsers", () => {
  test("registers the ['admin-users', search] query key, defaulting undefined search to ''", async () => {
    mockedFetchAdminUsers.mockResolvedValue({ users: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useFetchAdminUsers({ search: undefined as unknown as string }),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(["admin-users", ""]);
  });

  test("registers the search term verbatim in the query key when given", async () => {
    mockedFetchAdminUsers.mockResolvedValue({ users: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminUsers({ search: "jane" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(["admin-users", "jane"]);
  });

  test("fetches page 1 first via fetchAdminUsers(search, pageParam)", async () => {
    mockedFetchAdminUsers.mockResolvedValue({ users: [user("u1")], totalLength: 1 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminUsers({ search: "jane" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedFetchAdminUsers).toHaveBeenCalledWith("jane", 1);
  });

  test("getNextPageParam requests another page while more users remain", async () => {
    mockedFetchAdminUsers.mockResolvedValueOnce({
      users: [user("u1"), user("u2")],
      totalLength: 3,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminUsers({ search: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchAdminUsers.mockResolvedValueOnce({ users: [user("u3")], totalLength: 3 });

    act(() => {
      result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));

    expect(mockedFetchAdminUsers).toHaveBeenLastCalledWith("", 2);
    // 3 of 3 loaded now: exactly at the boundary, so no further page is offered.
    expect(result.current.hasNextPage).toBe(false);
  });

  test("getNextPageParam is undefined once every user has been loaded on page 1", async () => {
    mockedFetchAdminUsers.mockResolvedValue({ users: [user("u1")], totalLength: 1 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchAdminUsers({ search: "" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe("useUpdateUserRole", () => {
  test("calls updateUserRole(id, role) with the mutation input", async () => {
    mockedUpdateUserRole.mockResolvedValue(user("u1", "admin"));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateUserRole(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "u1", role: "admin" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateUserRole).toHaveBeenCalledWith("u1", "admin");
  });

  test("on success, patches the matching user in every cached ['admin-users'] infinite-query page in place", async () => {
    const updatedUser = user("u1", "admin");
    mockedUpdateUserRole.mockResolvedValue(updatedUser);
    const { queryClient, Wrapper } = createWrapper();

    const seedData: { pages: AdminUserPage[]; pageParams: unknown[] } = {
      pages: [
        { users: [user("u1", "user"), user("u2", "user")], totalLength: 2 },
      ],
      pageParams: [1],
    };
    queryClient.setQueryData(["admin-users", ""], seedData);
    queryClient.setQueryData(["admin-users", "jane"], seedData);

    const setQueriesDataSpy = jest.spyOn(queryClient, "setQueriesData");

    const { result } = renderHook(() => useUpdateUserRole(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "u1", role: "admin" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setQueriesDataSpy).toHaveBeenCalledWith(
      { queryKey: ["admin-users"], exact: false },
      expect.any(Function)
    );

    // exact: false means both the "" and "jane" search caches are touched by one mutation.
    const cacheForDefault = queryClient.getQueryData(["admin-users", ""]) as typeof seedData;
    const cacheForSearch = queryClient.getQueryData(["admin-users", "jane"]) as typeof seedData;

    expect(cacheForDefault.pages[0].users).toEqual([updatedUser, user("u2", "user")]);
    expect(cacheForSearch.pages[0].users).toEqual([updatedUser, user("u2", "user")]);
    // Only the targeted user's role changed — the untouched user is byte-for-byte the same object.
    expect(cacheForDefault.pages[0].users[1]).toBe(seedData.pages[0].users[1]);
  });

  test("leaves non-infinite-query cache data (no .pages) untouched", async () => {
    mockedUpdateUserRole.mockResolvedValue(user("u1", "admin"));
    const { queryClient, Wrapper } = createWrapper();

    queryClient.setQueryData(["admin-users", "not-an-infinite-query"], { foo: "bar" });

    const { result } = renderHook(() => useUpdateUserRole(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ id: "u1", role: "admin" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(["admin-users", "not-an-infinite-query"])).toEqual({
      foo: "bar",
    });
  });
});
