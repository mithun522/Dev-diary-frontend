jest.mock("../../../src/api/services/user-profile.service");

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFetchUserProfile } from "../../../src/api/hooks/useFetchProfile";
import { fetchUserProfile } from "../../../src/api/services/user-profile.service";
import type { UserProfile } from "../../../src/store/UserStore";

const mockedFetchUserProfile = fetchUserProfile as jest.MockedFunction<typeof fetchUserProfile>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const profile: UserProfile = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  professionalDetails: { currentRole: "Engineer" },
  socialLinks: {},
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchUserProfile", () => {
  test("registers queryKey ['profile'] and calls the service with no arguments", async () => {
    mockedFetchUserProfile.mockResolvedValue(profile);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchUserProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedFetchUserProfile).toHaveBeenCalledWith();
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["profile"]);
  });

  test("surfaces the profile returned by the service", async () => {
    mockedFetchUserProfile.mockResolvedValue(profile);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchUserProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(profile);
  });

  test("surfaces a rejected fetch as an error state rather than swallowing it", async () => {
    mockedFetchUserProfile.mockRejectedValue(new Error("401"));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchUserProfile(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("401"));
  });
});
