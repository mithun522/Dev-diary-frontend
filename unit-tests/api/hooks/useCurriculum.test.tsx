jest.mock("../../../src/api/services/curriculum.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCurriculumTopics,
  useCreateCurriculumTopic,
  useUpdateCurriculumTopic,
  useDeleteCurriculumTopic,
  useCurriculumProblems,
  useCreateCurriculumProblem,
  useCurriculumProblemDetail,
  useUpdateCurriculumProblem,
  useDeleteCurriculumProblem,
  useReplaceCurriculumTestCases,
  useRunCurriculumSolution,
  useSubmitCurriculumSolution,
  useCurriculumSubmissions,
  useCurriculumProgress,
} from "../../../src/api/hooks/useCurriculum";
import {
  fetchCurriculumTopics,
  createCurriculumTopic,
  updateCurriculumTopic,
  deleteCurriculumTopic,
  fetchCurriculumProblems,
  createCurriculumProblem,
  fetchCurriculumProblemDetail,
  updateCurriculumProblem,
  deleteCurriculumProblem,
  replaceCurriculumTestCases,
  runCurriculumSolution,
  submitCurriculumSolution,
  fetchCurriculumSubmissions,
  fetchCurriculumProgress,
} from "../../../src/api/services/curriculum.service";
import type {
  CurriculumSubmission,
  CurriculumTopicInput,
  CurriculumProblemInput,
} from "../../../src/data/curriculumData";

const mocked = {
  fetchCurriculumTopics: fetchCurriculumTopics as jest.MockedFunction<typeof fetchCurriculumTopics>,
  createCurriculumTopic: createCurriculumTopic as jest.MockedFunction<typeof createCurriculumTopic>,
  updateCurriculumTopic: updateCurriculumTopic as jest.MockedFunction<typeof updateCurriculumTopic>,
  deleteCurriculumTopic: deleteCurriculumTopic as jest.MockedFunction<typeof deleteCurriculumTopic>,
  fetchCurriculumProblems: fetchCurriculumProblems as jest.MockedFunction<
    typeof fetchCurriculumProblems
  >,
  createCurriculumProblem: createCurriculumProblem as jest.MockedFunction<
    typeof createCurriculumProblem
  >,
  fetchCurriculumProblemDetail: fetchCurriculumProblemDetail as jest.MockedFunction<
    typeof fetchCurriculumProblemDetail
  >,
  updateCurriculumProblem: updateCurriculumProblem as jest.MockedFunction<
    typeof updateCurriculumProblem
  >,
  deleteCurriculumProblem: deleteCurriculumProblem as jest.MockedFunction<
    typeof deleteCurriculumProblem
  >,
  replaceCurriculumTestCases: replaceCurriculumTestCases as jest.MockedFunction<
    typeof replaceCurriculumTestCases
  >,
  runCurriculumSolution: runCurriculumSolution as jest.MockedFunction<
    typeof runCurriculumSolution
  >,
  submitCurriculumSolution: submitCurriculumSolution as jest.MockedFunction<
    typeof submitCurriculumSolution
  >,
  fetchCurriculumSubmissions: fetchCurriculumSubmissions as jest.MockedFunction<
    typeof fetchCurriculumSubmissions
  >,
  fetchCurriculumProgress: fetchCurriculumProgress as jest.MockedFunction<
    typeof fetchCurriculumProgress
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

const submission = (overrides: Partial<CurriculumSubmission> = {}): CurriculumSubmission => ({
  id: "s1",
  problemId: "p1",
  sourceCode: "print(1)",
  status: "ACCEPTED",
  results: [],
  runtimeMs: 5,
  createdAt: "2024-01-01",
  ...overrides,
});

const topicInput: CurriculumTopicInput = { slug: "t", title: "T", description: "d" };
const problemInput: CurriculumProblemInput = {
  slug: "p",
  title: "P",
  description: "d",
  language: "python",
  level: "beginner",
  starterCode: "print()",
  testCases: [{ expectedStdout: "1", isSample: true }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCurriculumTopics", () => {
  test("registers queryKey ['curriculum-topics'] and calls the service (passed directly as queryFn)", async () => {
    mocked.fetchCurriculumTopics.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurriculumTopics(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.fetchCurriculumTopics).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["curriculum-topics"]);
  });
});

describe("topic mutations invalidate ['curriculum-topics']", () => {
  test("useCreateCurriculumTopic calls the service with the payload and invalidates ['curriculum-topics']", async () => {
    mocked.createCurriculumTopic.mockResolvedValue({
      id: "t1",
      slug: "t",
      title: "T",
      description: "d",
      position: 1,
      createdAt: "x",
      updatedAt: "x",
    });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCurriculumTopic(), { wrapper: Wrapper });
    act(() => result.current.mutate(topicInput));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.createCurriculumTopic).toHaveBeenCalledWith(topicInput);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-topics"] });
  });

  test("useUpdateCurriculumTopic calls the service with id+payload and invalidates ['curriculum-topics']", async () => {
    mocked.updateCurriculumTopic.mockResolvedValue({
      id: "t1",
      slug: "t",
      title: "T",
      description: "d",
      position: 1,
      createdAt: "x",
      updatedAt: "x",
    });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCurriculumTopic(), { wrapper: Wrapper });
    act(() => result.current.mutate({ id: "t1", payload: topicInput }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.updateCurriculumTopic).toHaveBeenCalledWith("t1", topicInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-topics"] });
  });

  test("useDeleteCurriculumTopic calls the service with the id and invalidates ['curriculum-topics']", async () => {
    mocked.deleteCurriculumTopic.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCurriculumTopic(), { wrapper: Wrapper });
    act(() => result.current.mutate("t1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.deleteCurriculumTopic).toHaveBeenCalledWith("t1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-topics"] });
  });
});

describe("useCurriculumProblems", () => {
  test("registers queryKey ['curriculum-problems', topicId, language ?? \"\"] and normalizes an omitted language", async () => {
    mocked.fetchCurriculumProblems.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurriculumProblems("t1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.fetchCurriculumProblems).toHaveBeenCalledWith("t1", undefined);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["curriculum-problems", "t1", ""]);
  });

  test("embeds a given language in the queryKey", async () => {
    mocked.fetchCurriculumProblems.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useCurriculumProblems("t1", "python"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["curriculum-problems", "t1", "python"]);
    });
    expect(mocked.fetchCurriculumProblems).toHaveBeenCalledWith("t1", "python");
  });

  test("is disabled (never calls the service) when topicId is an empty string", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCurriculumProblems(""), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocked.fetchCurriculumProblems).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateCurriculumProblem", () => {
  test("calls the service with topicId+payload and invalidates only this topic's ['curriculum-problems', topicId]", async () => {
    mocked.createCurriculumProblem.mockResolvedValue({
      id: "p1",
      topicId: "t1",
      slug: "p",
      title: "P",
      description: "d",
      language: "python",
      level: "beginner",
      starterCode: "print()",
      position: 1,
      solved: false,
      createdAt: "x",
      updatedAt: "x",
    });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCurriculumProblem("t1"), { wrapper: Wrapper });
    act(() => result.current.mutate(problemInput));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.createCurriculumProblem).toHaveBeenCalledWith("t1", problemInput);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problems", "t1"] });
  });

  test("invalidating ['curriculum-problems', topicId] does not mark a different topic's cached list as stale", async () => {
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["curriculum-problems", "other-topic", ""], []);
    mocked.createCurriculumProblem.mockResolvedValue({
      id: "p1",
      topicId: "t1",
      slug: "p",
      title: "P",
      description: "d",
      language: "python",
      level: "beginner",
      starterCode: "print()",
      position: 1,
      solved: false,
      createdAt: "x",
      updatedAt: "x",
    });

    const { result } = renderHook(() => useCreateCurriculumProblem("t1"), { wrapper: Wrapper });
    act(() => result.current.mutate(problemInput));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryState(["curriculum-problems", "other-topic", ""])?.isInvalidated
    ).toBe(false);
  });
});

describe("useCurriculumProblemDetail", () => {
  test("registers queryKey ['curriculum-problem', id] and is disabled when id is empty", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCurriculumProblemDetail(""), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mocked.fetchCurriculumProblemDetail).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  test("calls the service with the id when given", async () => {
    mocked.fetchCurriculumProblemDetail.mockResolvedValue({
      id: "p1",
      topicId: "t1",
      slug: "p",
      title: "P",
      description: "d",
      language: "python",
      level: "beginner",
      starterCode: "print()",
      position: 1,
      solved: false,
      createdAt: "x",
      updatedAt: "x",
      sampleTestCases: [],
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurriculumProblemDetail("p1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.fetchCurriculumProblemDetail).toHaveBeenCalledWith("p1");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["curriculum-problem", "p1"]);
  });
});

describe("useUpdateCurriculumProblem", () => {
  test("invalidates BOTH ['curriculum-problems', topicId] and ['curriculum-problem', id] on success", async () => {
    mocked.updateCurriculumProblem.mockResolvedValue({
      id: "p1",
      topicId: "t1",
      slug: "p",
      title: "P",
      description: "d",
      language: "python",
      level: "beginner",
      starterCode: "print()",
      position: 1,
      solved: false,
      createdAt: "x",
      updatedAt: "x",
    });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCurriculumProblem("t1"), { wrapper: Wrapper });
    act(() => result.current.mutate({ id: "p1", payload: problemInput }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.updateCurriculumProblem).toHaveBeenCalledWith("p1", problemInput);
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problems", "t1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problem", "p1"] });
  });
});

describe("useDeleteCurriculumProblem", () => {
  test("calls the service with the id and invalidates ['curriculum-problems', topicId]", async () => {
    mocked.deleteCurriculumProblem.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCurriculumProblem("t1"), { wrapper: Wrapper });
    act(() => result.current.mutate("p1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.deleteCurriculumProblem).toHaveBeenCalledWith("p1");
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problems", "t1"] });
  });
});

describe("useReplaceCurriculumTestCases", () => {
  test("calls the service with the id and test cases and invalidates ['curriculum-problem', id]", async () => {
    mocked.replaceCurriculumTestCases.mockResolvedValue([]);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const cases = [{ expectedStdout: "1", isSample: true }];

    const { result } = renderHook(() => useReplaceCurriculumTestCases("p1"), { wrapper: Wrapper });
    act(() => result.current.mutate(cases));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.replaceCurriculumTestCases).toHaveBeenCalledWith("p1", cases);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problem", "p1"] });
  });
});

describe("useRunCurriculumSolution", () => {
  test("calls the service with the id and sourceCode and invalidates nothing", async () => {
    mocked.runCurriculumSolution.mockResolvedValue({ status: "ACCEPTED", results: [], runtimeMs: 3 });
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRunCurriculumSolution("p1"), { wrapper: Wrapper });
    act(() => result.current.mutate("print(1)"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.runCurriculumSolution).toHaveBeenCalledWith("p1", "print(1)");
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useSubmitCurriculumSolution — conditional invalidation on ACCEPTED", () => {
  test("an ACCEPTED submission invalidates five keys: submissions, the activity heatmap, this problem, every curriculum-problems list, and progress", async () => {
    mocked.submitCurriculumSolution.mockResolvedValue(submission({ status: "ACCEPTED" }));
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSubmitCurriculumSolution("p1"), { wrapper: Wrapper });
    act(() => result.current.mutate("print(1)"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.submitCurriculumSolution).toHaveBeenCalledWith("p1", "print(1)");
    expect(invalidateSpy).toHaveBeenCalledTimes(5);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-submissions", "p1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dsa", "activity-heatmap"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problem", "p1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-problems"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-progress"] });
  });

  test.each(["WRONG_ANSWER", "RUNTIME_ERROR", "TIMED_OUT", "COMPILE_ERROR"] as const)(
    "a %s submission invalidates ONLY submissions and the activity heatmap — no problem/problems/progress refetch",
    async (status) => {
      mocked.submitCurriculumSolution.mockResolvedValue(submission({ status }));
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useSubmitCurriculumSolution("p1"), { wrapper: Wrapper });
      act(() => result.current.mutate("print(1)"));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["curriculum-submissions", "p1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dsa", "activity-heatmap"] });
    }
  );

  test("a non-ACCEPTED submission's single invalidation does not mark ['curriculum-problem', id] as stale", async () => {
    mocked.submitCurriculumSolution.mockResolvedValue(submission({ status: "WRONG_ANSWER" }));
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["curriculum-problem", "p1"], { id: "p1", solved: false });
    queryClient.setQueryData(["curriculum-progress", ""], { totalProblems: 1, solvedProblems: 0 });

    const { result } = renderHook(() => useSubmitCurriculumSolution("p1"), { wrapper: Wrapper });
    act(() => result.current.mutate("print(1)"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["curriculum-problem", "p1"])?.isInvalidated).toBe(false);
    expect(queryClient.getQueryState(["curriculum-progress", ""])?.isInvalidated).toBe(false);
  });

  test("an ACCEPTED submission's ['curriculum-problems'] invalidation partial-matches every topic/language variant", async () => {
    mocked.submitCurriculumSolution.mockResolvedValue(submission({ status: "ACCEPTED" }));
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["curriculum-problems", "t1", ""], []);
    queryClient.setQueryData(["curriculum-problems", "t2", "python"], []);
    queryClient.setQueryData(["curriculum-progress", ""], { totalProblems: 1, solvedProblems: 1 });

    const { result } = renderHook(() => useSubmitCurriculumSolution("p1"), { wrapper: Wrapper });
    act(() => result.current.mutate("print(1)"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["curriculum-problems", "t1", ""])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["curriculum-problems", "t2", "python"])?.isInvalidated).toBe(
      true
    );
    expect(queryClient.getQueryState(["curriculum-progress", ""])?.isInvalidated).toBe(true);
  });
});

describe("useCurriculumSubmissions", () => {
  test("registers queryKey ['curriculum-submissions', id] and is disabled when id is empty", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCurriculumSubmissions(""), { wrapper: Wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mocked.fetchCurriculumSubmissions).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  test("calls the service with the id when given", async () => {
    mocked.fetchCurriculumSubmissions.mockResolvedValue([submission()]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurriculumSubmissions("p1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.fetchCurriculumSubmissions).toHaveBeenCalledWith("p1");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["curriculum-submissions", "p1"]);
  });
});

describe("useCurriculumProgress", () => {
  test("registers queryKey ['curriculum-progress', ''] and calls the service with undefined when no language is given", async () => {
    mocked.fetchCurriculumProgress.mockResolvedValue({
      totalProblems: 0,
      solvedProblems: 0,
      solvedProblemIds: [],
      byTopic: [],
    });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useCurriculumProgress(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocked.fetchCurriculumProgress).toHaveBeenCalledWith(undefined);
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["curriculum-progress", ""]);
  });

  test("embeds a given language in the queryKey and passes it to the service", async () => {
    mocked.fetchCurriculumProgress.mockResolvedValue({
      totalProblems: 0,
      solvedProblems: 0,
      solvedProblemIds: [],
      byTopic: [],
    });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useCurriculumProgress("java"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["curriculum-progress", "java"]);
    });
    expect(mocked.fetchCurriculumProgress).toHaveBeenCalledWith("java");
  });
});
