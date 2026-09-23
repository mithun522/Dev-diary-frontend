jest.mock("../../../src/api/services/adminInterviewSimulator.service");

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useFetchMockInterviews,
  useCreateMockInterview,
  useUpdateMockInterview,
  useDeleteMockInterview,
  useFetchMockInterviewQuestions,
  useCreateMockInterviewQuestion,
  useUpdateMockInterviewQuestion,
  useDeleteMockInterviewQuestion,
  useFetchCompanyProblems,
  useCreateCompanyProblem,
  useUpdateCompanyProblem,
  useDeleteCompanyProblem,
  useFetchBehavioralQuestions,
  useCreateBehavioralQuestion,
  useUpdateBehavioralQuestion,
  useDeleteBehavioralQuestion,
} from "../../../src/api/hooks/useAdminInterviewSimulator";
import {
  fetchMockInterviews,
  createMockInterview,
  updateMockInterview,
  deleteMockInterview,
  fetchMockInterviewQuestions,
  createMockInterviewQuestion,
  updateMockInterviewQuestion,
  deleteMockInterviewQuestion,
  fetchCompanyProblems,
  createCompanyProblem,
  updateCompanyProblem,
  deleteCompanyProblem,
  fetchBehavioralQuestions,
  createBehavioralQuestion,
  updateBehavioralQuestion,
  deleteBehavioralQuestion,
  type MockInterviewInput,
  type MockInterviewQuestion,
  type QuestionInput,
  type CompanyProblemInput,
  type BehavioralQuestionInput,
} from "../../../src/api/services/adminInterviewSimulator.service";
import type {
  MockInterview,
  CompanyProblem,
  BehavioralQuestion,
} from "../../../src/data/interviewData";

const mocked = <T extends (...args: never[]) => unknown>(fn: T) =>
  fn as jest.MockedFunction<T>;

const mockedFetchMockInterviews = mocked(fetchMockInterviews);
const mockedCreateMockInterview = mocked(createMockInterview);
const mockedUpdateMockInterview = mocked(updateMockInterview);
const mockedDeleteMockInterview = mocked(deleteMockInterview);
const mockedFetchMockInterviewQuestions = mocked(fetchMockInterviewQuestions);
const mockedCreateMockInterviewQuestion = mocked(createMockInterviewQuestion);
const mockedUpdateMockInterviewQuestion = mocked(updateMockInterviewQuestion);
const mockedDeleteMockInterviewQuestion = mocked(deleteMockInterviewQuestion);
const mockedFetchCompanyProblems = mocked(fetchCompanyProblems);
const mockedCreateCompanyProblem = mocked(createCompanyProblem);
const mockedUpdateCompanyProblem = mocked(updateCompanyProblem);
const mockedDeleteCompanyProblem = mocked(deleteCompanyProblem);
const mockedFetchBehavioralQuestions = mocked(fetchBehavioralQuestions);
const mockedCreateBehavioralQuestion = mocked(createBehavioralQuestion);
const mockedUpdateBehavioralQuestion = mocked(updateBehavioralQuestion);
const mockedDeleteBehavioralQuestion = mocked(deleteBehavioralQuestion);

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

const mockInterview: MockInterview = {
  id: "mi1",
  title: "Frontend Deep Dive",
  description: "...",
  difficulty: "Medium",
  duration: 45,
  topics: ["react"],
  rating: 4.5,
};

const mockInterviewInput: MockInterviewInput = {
  title: "Frontend Deep Dive",
  description: "...",
  difficulty: "Medium",
  duration: 45,
  topics: ["react"],
  rating: 4.5,
};

const mockQuestion: MockInterviewQuestion = {
  id: "q1",
  type: "coding",
  question: "Reverse a linked list",
  difficulty: "Medium",
  topics: ["dsa"],
  data: {},
};

const questionInput: QuestionInput = {
  type: "coding",
  question: "Reverse a linked list",
  difficulty: "Medium",
  topics: ["dsa"],
  timeLimit: 30,
  data: {},
};

const companyProblem: CompanyProblem = {
  id: "cp1",
  company: "Acme",
  title: "Rate limiter",
  link: "https://example.com",
  difficulty: "Hard",
  tags: ["system-design"],
  solved: false,
};

const companyProblemInput: CompanyProblemInput = {
  company: "Acme",
  title: "Rate limiter",
  link: "https://example.com",
  difficulty: "Hard",
  tags: ["system-design"],
};

const behavioralQuestion: BehavioralQuestion = {
  id: "bq1",
  question: "Tell me about a conflict",
  category: "teamwork",
};

const behavioralQuestionInput: BehavioralQuestionInput = {
  question: "Tell me about a conflict",
  category: "teamwork",
  tips: ["Use STAR"],
};

describe("mock interviews", () => {
  test("useFetchMockInterviews registers ['admin-mock-interviews'] and calls fetchMockInterviews", async () => {
    mockedFetchMockInterviews.mockResolvedValue([mockInterview]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchMockInterviews(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-mock-interviews",
    ]);
    expect(result.current.data).toEqual([mockInterview]);
  });

  test("useCreateMockInterview calls createMockInterview(input) and invalidates ['admin-mock-interviews']", async () => {
    mockedCreateMockInterview.mockResolvedValue(mockInterview);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateMockInterview(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate(mockInterviewInput);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateMockInterview).toHaveBeenCalledWith(mockInterviewInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-mock-interviews"] });
  });

  test("useUpdateMockInterview calls updateMockInterview(id, input) and invalidates ['admin-mock-interviews']", async () => {
    mockedUpdateMockInterview.mockResolvedValue(mockInterview);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateMockInterview(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate({ id: "mi1", input: mockInterviewInput });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateMockInterview).toHaveBeenCalledWith("mi1", mockInterviewInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-mock-interviews"] });
  });

  test("useDeleteMockInterview calls deleteMockInterview(id) and invalidates ['admin-mock-interviews']", async () => {
    mockedDeleteMockInterview.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteMockInterview(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate("mi1");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteMockInterview).toHaveBeenCalledWith("mi1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-mock-interviews"] });
  });
});

describe("mock interview questions (nested under an interviewId)", () => {
  test("useFetchMockInterviewQuestions registers ['admin-mock-interview-questions', interviewId]", async () => {
    mockedFetchMockInterviewQuestions.mockResolvedValue([mockQuestion]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchMockInterviewQuestions("mi1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-mock-interview-questions",
      "mi1",
    ]);
    expect(mockedFetchMockInterviewQuestions).toHaveBeenCalledWith("mi1");
  });

  test("useFetchMockInterviewQuestions normalizes an undefined interviewId to '' in the key and does not call the service (enabled: !!interviewId)", () => {
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchMockInterviewQuestions(undefined), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedFetchMockInterviewQuestions).not.toHaveBeenCalled();
    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-mock-interview-questions",
      "",
    ]);
  });

  test("useCreateMockInterviewQuestion calls createMockInterviewQuestion(interviewId, input) and invalidates only that interview's questions key", async () => {
    mockedCreateMockInterviewQuestion.mockResolvedValue(mockQuestion);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateMockInterviewQuestion("mi1"), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.mutate(questionInput);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateMockInterviewQuestion).toHaveBeenCalledWith("mi1", questionInput);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["admin-mock-interview-questions", "mi1"],
    });
  });

  test("useUpdateMockInterviewQuestion calls updateMockInterviewQuestion(interviewId, questionId, input) and invalidates that interview's questions key", async () => {
    mockedUpdateMockInterviewQuestion.mockResolvedValue(mockQuestion);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateMockInterviewQuestion("mi1"), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.mutate({ questionId: "q1", input: questionInput });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateMockInterviewQuestion).toHaveBeenCalledWith(
      "mi1",
      "q1",
      questionInput
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["admin-mock-interview-questions", "mi1"],
    });
  });

  test("useDeleteMockInterviewQuestion calls deleteMockInterviewQuestion(interviewId, questionId) and invalidates that interview's questions key", async () => {
    mockedDeleteMockInterviewQuestion.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteMockInterviewQuestion("mi1"), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.mutate("q1");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteMockInterviewQuestion).toHaveBeenCalledWith("mi1", "q1");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["admin-mock-interview-questions", "mi1"],
    });
  });

  test("mutations for one interviewId do not invalidate a different interviewId's questions key", async () => {
    mockedDeleteMockInterviewQuestion.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteMockInterviewQuestion("mi1"), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.mutate("q1");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ["admin-mock-interview-questions", "mi2"],
    });
  });
});

describe("company problems", () => {
  test("useFetchCompanyProblems registers ['admin-company-problems'] and calls fetchCompanyProblems", async () => {
    mockedFetchCompanyProblems.mockResolvedValue([companyProblem]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchCompanyProblems(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-company-problems",
    ]);
    expect(result.current.data).toEqual([companyProblem]);
  });

  test("useCreateCompanyProblem calls createCompanyProblem(input) and invalidates ['admin-company-problems']", async () => {
    mockedCreateCompanyProblem.mockResolvedValue(companyProblem);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateCompanyProblem(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate(companyProblemInput);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateCompanyProblem).toHaveBeenCalledWith(companyProblemInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-company-problems"] });
  });

  test("useUpdateCompanyProblem calls updateCompanyProblem(id, input) and invalidates ['admin-company-problems']", async () => {
    mockedUpdateCompanyProblem.mockResolvedValue(companyProblem);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateCompanyProblem(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate({ id: "cp1", input: companyProblemInput });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateCompanyProblem).toHaveBeenCalledWith("cp1", companyProblemInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-company-problems"] });
  });

  test("useDeleteCompanyProblem calls deleteCompanyProblem(id) and invalidates ['admin-company-problems']", async () => {
    mockedDeleteCompanyProblem.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteCompanyProblem(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate("cp1");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteCompanyProblem).toHaveBeenCalledWith("cp1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-company-problems"] });
  });
});

describe("behavioral questions", () => {
  test("useFetchBehavioralQuestions registers ['admin-behavioral-questions'] and calls fetchBehavioralQuestions", async () => {
    mockedFetchBehavioralQuestions.mockResolvedValue([behavioralQuestion]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchBehavioralQuestions(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryCache().findAll()[0].queryKey).toEqual([
      "admin-behavioral-questions",
    ]);
    expect(result.current.data).toEqual([behavioralQuestion]);
  });

  test("useCreateBehavioralQuestion calls createBehavioralQuestion(input) and invalidates ['admin-behavioral-questions']", async () => {
    mockedCreateBehavioralQuestion.mockResolvedValue(behavioralQuestion);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateBehavioralQuestion(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate(behavioralQuestionInput);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedCreateBehavioralQuestion).toHaveBeenCalledWith(behavioralQuestionInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-behavioral-questions"] });
  });

  test("useUpdateBehavioralQuestion calls updateBehavioralQuestion(id, input) and invalidates ['admin-behavioral-questions']", async () => {
    mockedUpdateBehavioralQuestion.mockResolvedValue(behavioralQuestion);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateBehavioralQuestion(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate({ id: "bq1", input: behavioralQuestionInput });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedUpdateBehavioralQuestion).toHaveBeenCalledWith("bq1", behavioralQuestionInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-behavioral-questions"] });
  });

  test("useDeleteBehavioralQuestion calls deleteBehavioralQuestion(id) and invalidates ['admin-behavioral-questions']", async () => {
    mockedDeleteBehavioralQuestion.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteBehavioralQuestion(), { wrapper: Wrapper });
    act(() => {
      result.current.mutate("bq1");
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedDeleteBehavioralQuestion).toHaveBeenCalledWith("bq1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin-behavioral-questions"] });
  });
});
