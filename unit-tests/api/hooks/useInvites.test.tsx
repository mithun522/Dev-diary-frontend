jest.mock("../../../src/api/services/invites.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useInviteAdmin,
  useInviteStudents,
  useAcceptInvite,
  useListInvites,
  useResendInvite,
  useRevokeInvite,
  useSeatUsage,
  useListAdmins,
  useUpdateAdminSeatLimit,
} from "../../../src/api/hooks/useInvites";
import {
  inviteAdmin,
  inviteStudents,
  acceptInvite,
  listInvites,
  resendInvite,
  revokeInvite,
  getSeatUsage,
  listAdmins,
  updateAdminSeatLimit,
  type Invite,
  type AdminSummary,
} from "../../../src/api/services/invites.service";

const mockedInviteAdmin = inviteAdmin as jest.MockedFunction<typeof inviteAdmin>;
const mockedInviteStudents = inviteStudents as jest.MockedFunction<typeof inviteStudents>;
const mockedAcceptInvite = acceptInvite as jest.MockedFunction<typeof acceptInvite>;
const mockedListInvites = listInvites as jest.MockedFunction<typeof listInvites>;
const mockedResendInvite = resendInvite as jest.MockedFunction<typeof resendInvite>;
const mockedRevokeInvite = revokeInvite as jest.MockedFunction<typeof revokeInvite>;
const mockedGetSeatUsage = getSeatUsage as jest.MockedFunction<typeof getSeatUsage>;
const mockedListAdmins = listAdmins as jest.MockedFunction<typeof listAdmins>;
const mockedUpdateAdminSeatLimit = updateAdminSeatLimit as jest.MockedFunction<
  typeof updateAdminSeatLimit
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

const invite: Invite = {
  id: "i1",
  email: "a@b.com",
  role: "user",
  status: "pending",
  createdAt: "2024-01-01T00:00:00Z",
  expiresAt: "2024-01-08T00:00:00Z",
};

const adminSummary: AdminSummary = {
  id: "a1",
  email: "admin@b.com",
  firstName: "A",
  lastName: "B",
  status: "active",
  seatLimit: 10,
  seatUsed: 3,
  createdAt: "2024-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useInviteAdmin", () => {
  test("calls inviteAdmin(email, seatLimit) and invalidates both ['invites'] and ['super-admin-admins']", async () => {
    mockedInviteAdmin.mockResolvedValue({ message: "ok" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useInviteAdmin(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ email: "admin@b.com", seatLimit: 5 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedInviteAdmin).toHaveBeenCalledWith("admin@b.com", 5);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["invites"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["super-admin-admins"] });
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });
});

describe("useInviteStudents", () => {
  test("calls inviteStudents(emails) and invalidates only ['invites']", async () => {
    mockedInviteStudents.mockResolvedValue({ message: "ok", results: [] });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useInviteStudents(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate(["a@b.com", "c@d.com"]);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedInviteStudents).toHaveBeenCalledWith(["a@b.com", "c@d.com"]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["invites"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["super-admin-admins"] });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});

describe("useAcceptInvite", () => {
  test("calls acceptInvite(token, firstName, lastName, password) with the mutation input", async () => {
    mockedAcceptInvite.mockResolvedValue({ message: "ok", token: "jwt" });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAcceptInvite(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({
        token: "invite-token",
        firstName: "Jane",
        lastName: "Doe",
        password: "hunter2",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedAcceptInvite).toHaveBeenCalledWith(
      "invite-token",
      "Jane",
      "Doe",
      "hunter2"
    );
  });
});

describe("useListInvites", () => {
  test("registers the ['invites'] query key and calls listInvites", async () => {
    mockedListInvites.mockResolvedValue([invite]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useListInvites(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(["invites"]);
    expect(result.current.data).toEqual([invite]);
  });
});

describe("useResendInvite", () => {
  test("calls resendInvite(id) and invalidates only ['invites']", async () => {
    mockedResendInvite.mockResolvedValue({ message: "ok" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useResendInvite(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("i1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedResendInvite).toHaveBeenCalledWith("i1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["invites"] });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});

describe("useRevokeInvite", () => {
  test("calls revokeInvite(id) and invalidates both ['invites'] and ['super-admin-admins']", async () => {
    mockedRevokeInvite.mockResolvedValue({ message: "ok" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRevokeInvite(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate("i1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedRevokeInvite).toHaveBeenCalledWith("i1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["invites"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["super-admin-admins"] });
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });
});

describe("useSeatUsage", () => {
  test("registers the ['admin-seat-usage'] query key and calls getSeatUsage", async () => {
    mockedGetSeatUsage.mockResolvedValue({ seatLimit: 10, seatUsed: 3 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useSeatUsage(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual(["admin-seat-usage"]);
    expect(result.current.data).toEqual({ seatLimit: 10, seatUsed: 3 });
  });
});

describe("useListAdmins", () => {
  test("registers the ['super-admin-admins'] query key and calls listAdmins", async () => {
    mockedListAdmins.mockResolvedValue([adminSummary]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useListAdmins(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "super-admin-admins",
    ]);
    expect(result.current.data).toEqual([adminSummary]);
  });
});

describe("useUpdateAdminSeatLimit", () => {
  test("calls updateAdminSeatLimit(adminId, seatLimit) and invalidates only ['super-admin-admins']", async () => {
    mockedUpdateAdminSeatLimit.mockResolvedValue({ id: "a1", seatLimit: 20, seatUsed: 3 });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAdminSeatLimit(), { wrapper: Wrapper });

    act(() => {
      result.current.mutate({ adminId: "a1", seatLimit: 20 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateAdminSeatLimit).toHaveBeenCalledWith("a1", 20);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["super-admin-admins"] });
    expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ["invites"] });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});
