jest.mock("../../../src/api/services/adminProgress.service");

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useAdminStudentProgress,
  useAdminStudentsProgress,
} from "../../../src/api/hooks/useAdminProgress";
import {
  fetchAdminStudentProgress,
  fetchAdminStudentsProgress,
} from "../../../src/api/services/adminProgress.service";
import type { AdminStudentProgress } from "../../../src/data/adminProgressData";

const mockedFetchAdminStudentsProgress = fetchAdminStudentsProgress as jest.MockedFunction<
  typeof fetchAdminStudentsProgress
>;
const mockedFetchAdminStudentProgress = fetchAdminStudentProgress as jest.MockedFunction<
  typeof fetchAdminStudentProgress
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

const student = (overrides: Partial<AdminStudentProgress> = {}): AdminStudentProgress => ({
  userId: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  catalog: { totalProblems: 10, solvedProblems: 3, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
  curriculum: { totalProblems: 5, solvedProblems: 2, solvedProblemIds: [], byTopic: [] },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useAdminStudentsProgress", () => {
  test("registers queryKey ['admin-students-progress'] and calls the service with no args", async () => {
    mockedFetchAdminStudentsProgress.mockResolvedValue([student()]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useAdminStudentsProgress(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchAdminStudentsProgress).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["admin-students-progress"]);
  });

  test("returns the service's array as-is", async () => {
    const payload = [student({ userId: "u1" }), student({ userId: "u2" })];
    mockedFetchAdminStudentsProgress.mockResolvedValue(payload);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAdminStudentsProgress(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(payload);
  });
});

describe("useAdminStudentProgress", () => {
  test("is disabled (never calls the service) when no userId is given", async () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useAdminStudentProgress(undefined), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedFetchAdminStudentProgress).not.toHaveBeenCalled();
  });

  test("registers queryKey ['admin-student-progress', userId] and calls the service with the id", async () => {
    mockedFetchAdminStudentProgress.mockResolvedValue(student());
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useAdminStudentProgress("u1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchAdminStudentProgress).toHaveBeenCalledWith("u1");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["admin-student-progress", "u1"]);
  });

  test("returns the service's payload as-is", async () => {
    const payload = student();
    mockedFetchAdminStudentProgress.mockResolvedValue(payload);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAdminStudentProgress("u1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(payload);
  });
});
