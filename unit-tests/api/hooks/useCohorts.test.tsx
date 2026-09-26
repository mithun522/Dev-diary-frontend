jest.mock("../../../src/api/services/cohort.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useAddStudentsToCohort,
  useCohorts,
  useCohortStudents,
  useCreateCohort,
  useDeleteCohort,
  useRemoveStudentFromCohort,
  useRenameCohort,
} from "../../../src/api/hooks/useCohorts";
import {
  addStudentsToCohort,
  createCohort,
  deleteCohort,
  listCohortStudents,
  listCohorts,
  removeStudentFromCohort,
  renameCohort,
} from "../../../src/api/services/cohort.service";

const mocked = {
  listCohorts: listCohorts as jest.MockedFunction<typeof listCohorts>,
  listCohortStudents: listCohortStudents as jest.MockedFunction<typeof listCohortStudents>,
  createCohort: createCohort as jest.MockedFunction<typeof createCohort>,
  renameCohort: renameCohort as jest.MockedFunction<typeof renameCohort>,
  deleteCohort: deleteCohort as jest.MockedFunction<typeof deleteCohort>,
  addStudentsToCohort: addStudentsToCohort as jest.MockedFunction<typeof addStudentsToCohort>,
  removeStudentFromCohort: removeStudentFromCohort as jest.MockedFunction<
    typeof removeStudentFromCohort
  >,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const cohort = (overrides = {}) => ({
  id: "c1",
  name: "Batch A",
  studentCount: 2,
  createdAt: "2026-01-01",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCohorts", () => {
  test("registers queryKey ['cohorts'] and calls the service with no args", async () => {
    mocked.listCohorts.mockResolvedValue([cohort()]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCohorts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.listCohorts).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().findAll().map((q) => q.queryKey)).toContainEqual([
      "cohorts",
    ]);
  });
});

describe("useCohortStudents", () => {
  test("is disabled (never calls the service) when no cohortId is given", async () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useCohortStudents(undefined), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocked.listCohortStudents).not.toHaveBeenCalled();
  });

  test("registers queryKey ['cohort-students', cohortId] and calls the service with the id", async () => {
    mocked.listCohortStudents.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCohortStudents("c1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.listCohortStudents).toHaveBeenCalledWith("c1");
    expect(queryClient.getQueryCache().findAll().map((q) => q.queryKey)).toContainEqual([
      "cohort-students",
      "c1",
    ]);
  });
});

describe("useCreateCohort", () => {
  test("calls the service and invalidates ['cohorts'] on success", async () => {
    mocked.createCohort.mockResolvedValue(cohort());
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCohort(), { wrapper: Wrapper });
    act(() => result.current.mutate("Batch A"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.createCohort).toHaveBeenCalledWith("Batch A");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohorts"] });
  });
});

describe("useRenameCohort", () => {
  test("calls the service with id+name and invalidates ['cohorts']", async () => {
    mocked.renameCohort.mockResolvedValue(cohort({ name: "New Name" }));
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRenameCohort(), { wrapper: Wrapper });
    act(() => result.current.mutate({ id: "c1", name: "New Name" }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.renameCohort).toHaveBeenCalledWith("c1", "New Name");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohorts"] });
  });
});

describe("useDeleteCohort", () => {
  test("calls the service with the id and invalidates ['cohorts']", async () => {
    mocked.deleteCohort.mockResolvedValue({ message: "Cohort deleted" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCohort(), { wrapper: Wrapper });
    act(() => result.current.mutate("c1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.deleteCohort).toHaveBeenCalledWith("c1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohorts"] });
  });
});

describe("useAddStudentsToCohort", () => {
  test("calls the service with cohortId+studentIds and invalidates both cohort-students and cohorts", async () => {
    mocked.addStudentsToCohort.mockResolvedValue({ message: "Added 2 of 2", results: [] });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddStudentsToCohort("c1"), { wrapper: Wrapper });
    act(() => result.current.mutate(["u1", "u2"]));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.addStudentsToCohort).toHaveBeenCalledWith("c1", ["u1", "u2"]);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohort-students", "c1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohorts"] });
  });
});

describe("useRemoveStudentFromCohort", () => {
  test("calls the service with cohortId+studentId and invalidates both queries", async () => {
    mocked.removeStudentFromCohort.mockResolvedValue({ message: "Student removed from cohort" });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRemoveStudentFromCohort("c1"), { wrapper: Wrapper });
    act(() => result.current.mutate("u1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.removeStudentFromCohort).toHaveBeenCalledWith("c1", "u1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohort-students", "c1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cohorts"] });
  });
});
