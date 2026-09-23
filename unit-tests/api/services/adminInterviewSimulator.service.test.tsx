jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
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
  type QuestionInput,
  type CompanyProblemInput,
  type BehavioralQuestionInput,
} from "../../../src/api/services/adminInterviewSimulator.service";
import {
  MOCK_INTERVIEWS,
  MOCK_INTERVIEW_BY_ID,
  MOCK_INTERVIEW_QUESTIONS,
  MOCK_INTERVIEW_QUESTION_BY_ID,
  COMPANY_PROBLEMS,
  COMPANY_PROBLEM_BY_ID,
  BEHAVIORAL_QUESTIONS,
  BEHAVIORAL_QUESTION_BY_ID,
  INTERVIEW_SIMULATOR_API_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

// These admin-write endpoints are gated by `requireAdmin` on the backend rather than by a
// separate /admin URL namespace (unlike ADMIN_USERS / ADMIN_INTERVIEW_SESSIONS), so the exact
// collection path is what stands between an ordinary caller and admin-only writes.
describe("endpoint paths", () => {
  test("mock interviews / company problems / behavioral questions are top-level collections", () => {
    expect(MOCK_INTERVIEWS).toBe(`${INTERVIEW_SIMULATOR_API_URL}/mock-interviews`);
    expect(COMPANY_PROBLEMS).toBe(`${INTERVIEW_SIMULATOR_API_URL}/company-problems`);
    expect(BEHAVIORAL_QUESTIONS).toBe(`${INTERVIEW_SIMULATOR_API_URL}/behavioral-questions`);
  });
});

const mockInterviewInput: MockInterviewInput = {
  title: "System Design Basics",
  description: "An intro system design interview",
  difficulty: "Medium",
  duration: 45,
  topics: ["system-design"],
  rating: 4,
};

const questionInput: QuestionInput = {
  type: "mcq",
  question: "What is a load balancer?",
  difficulty: "Easy",
  topics: ["networking"],
  timeLimit: 60,
  data: { options: ["A", "B"], correctAnswer: 0 },
};

const companyProblemInput: CompanyProblemInput = {
  company: "Acme",
  title: "Two Sum",
  link: "https://example.com/two-sum",
  difficulty: "Easy",
  tags: ["arrays"],
};

const behavioralQuestionInput: BehavioralQuestionInput = {
  question: "Tell me about a time you disagreed with a teammate.",
  category: "teamwork",
  tips: ["Use the STAR method"],
};

describe("mock interviews", () => {
  test("fetchMockInterviews GETs the bare collection", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchMockInterviews();
    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_INTERVIEWS);
  });

  test("fetchMockInterviews returns the body unchanged", async () => {
    const interviews = [{ id: "m1" }];
    mockedAxios.get.mockResolvedValue({ data: interviews });
    await expect(fetchMockInterviews()).resolves.toBe(interviews);
  });

  test("fetchMockInterviews propagates a rejection", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(fetchMockInterviews()).rejects.toThrow("Forbidden");
  });

  test("createMockInterview POSTs the input verbatim to the collection", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "m1", ...mockInterviewInput } });
    await createMockInterview(mockInterviewInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(MOCK_INTERVIEWS, mockInterviewInput);
  });

  test("createMockInterview returns the created record", async () => {
    const created = { id: "m1", ...mockInterviewInput };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createMockInterview(mockInterviewInput)).resolves.toBe(created);
  });

  test("createMockInterview propagates a rejection", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Forbidden"));
    await expect(createMockInterview(mockInterviewInput)).rejects.toThrow("Forbidden");
  });

  test("updateMockInterview PUTs to the per-id sub-resource with the input verbatim", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "m1", ...mockInterviewInput } });
    await updateMockInterview("m1", mockInterviewInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(MOCK_INTERVIEW_BY_ID("m1"), mockInterviewInput);
  });

  test("updateMockInterview returns the updated record", async () => {
    const updated = { id: "m1", ...mockInterviewInput, rating: 5 };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateMockInterview("m1", mockInterviewInput)).resolves.toBe(updated);
  });

  test("updateMockInterview propagates a rejection", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateMockInterview("m1", mockInterviewInput)).rejects.toThrow("Forbidden");
  });

  test("deleteMockInterview DELETEs the per-id sub-resource", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteMockInterview("m1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(MOCK_INTERVIEW_BY_ID("m1"));
  });

  test("deleteMockInterview resolves with undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteMockInterview("m1")).resolves.toBeUndefined();
  });

  test("deleteMockInterview propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteMockInterview("m1")).rejects.toThrow("Forbidden");
  });
});

describe("mock interview questions (nested)", () => {
  test("fetchMockInterviewQuestions GETs the nested questions collection", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchMockInterviewQuestions("m1");
    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_INTERVIEW_QUESTIONS("m1"));
    expect(MOCK_INTERVIEW_QUESTIONS("m1")).toBe(`${MOCK_INTERVIEWS}/m1/questions`);
  });

  test("fetchMockInterviewQuestions returns the body unchanged", async () => {
    const questions = [{ id: "q1" }];
    mockedAxios.get.mockResolvedValue({ data: questions });
    await expect(fetchMockInterviewQuestions("m1")).resolves.toBe(questions);
  });

  test("fetchMockInterviewQuestions propagates a rejection", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(fetchMockInterviewQuestions("m1")).rejects.toThrow("Forbidden");
  });

  test("createMockInterviewQuestion POSTs the input verbatim to the nested collection", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "q1", ...questionInput } });
    await createMockInterviewQuestion("m1", questionInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(MOCK_INTERVIEW_QUESTIONS("m1"), questionInput);
  });

  test("createMockInterviewQuestion returns the created record", async () => {
    const created = { id: "q1", ...questionInput };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createMockInterviewQuestion("m1", questionInput)).resolves.toBe(created);
  });

  test("createMockInterviewQuestion propagates a rejection", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Forbidden"));
    await expect(createMockInterviewQuestion("m1", questionInput)).rejects.toThrow("Forbidden");
  });

  test("updateMockInterviewQuestion PUTs to the per-question sub-resource with the input verbatim", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "q1", ...questionInput } });
    await updateMockInterviewQuestion("m1", "q1", questionInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      MOCK_INTERVIEW_QUESTION_BY_ID("m1", "q1"),
      questionInput
    );
    expect(MOCK_INTERVIEW_QUESTION_BY_ID("m1", "q1")).toBe(
      `${MOCK_INTERVIEWS}/m1/questions/q1`
    );
  });

  test("updateMockInterviewQuestion returns the updated record", async () => {
    const updated = { id: "q1", ...questionInput, timeLimit: 90 };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateMockInterviewQuestion("m1", "q1", questionInput)).resolves.toBe(updated);
  });

  test("updateMockInterviewQuestion propagates a rejection", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateMockInterviewQuestion("m1", "q1", questionInput)).rejects.toThrow(
      "Forbidden"
    );
  });

  test("deleteMockInterviewQuestion DELETEs the per-question sub-resource", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteMockInterviewQuestion("m1", "q1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(MOCK_INTERVIEW_QUESTION_BY_ID("m1", "q1"));
  });

  test("deleteMockInterviewQuestion resolves with undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteMockInterviewQuestion("m1", "q1")).resolves.toBeUndefined();
  });

  test("deleteMockInterviewQuestion propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteMockInterviewQuestion("m1", "q1")).rejects.toThrow("Forbidden");
  });
});

describe("company problems", () => {
  test("fetchCompanyProblems GETs the bare collection", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCompanyProblems();
    expect(mockedAxios.get).toHaveBeenCalledWith(COMPANY_PROBLEMS);
  });

  test("fetchCompanyProblems returns the body unchanged", async () => {
    const problems = [{ id: "c1" }];
    mockedAxios.get.mockResolvedValue({ data: problems });
    await expect(fetchCompanyProblems()).resolves.toBe(problems);
  });

  test("fetchCompanyProblems propagates a rejection", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(fetchCompanyProblems()).rejects.toThrow("Forbidden");
  });

  test("createCompanyProblem POSTs the input verbatim to the collection", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "c1", ...companyProblemInput } });
    await createCompanyProblem(companyProblemInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(COMPANY_PROBLEMS, companyProblemInput);
  });

  test("createCompanyProblem returns the created record", async () => {
    const created = { id: "c1", ...companyProblemInput };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createCompanyProblem(companyProblemInput)).resolves.toBe(created);
  });

  test("createCompanyProblem propagates a rejection", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Forbidden"));
    await expect(createCompanyProblem(companyProblemInput)).rejects.toThrow("Forbidden");
  });

  test("updateCompanyProblem PUTs to the per-id sub-resource with the input verbatim", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "c1", ...companyProblemInput } });
    await updateCompanyProblem("c1", companyProblemInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(COMPANY_PROBLEM_BY_ID("c1"), companyProblemInput);
  });

  test("updateCompanyProblem returns the updated record", async () => {
    const updated = { id: "c1", ...companyProblemInput, difficulty: "Hard" as const };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateCompanyProblem("c1", companyProblemInput)).resolves.toBe(updated);
  });

  test("updateCompanyProblem propagates a rejection", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateCompanyProblem("c1", companyProblemInput)).rejects.toThrow("Forbidden");
  });

  test("deleteCompanyProblem DELETEs the per-id sub-resource", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteCompanyProblem("c1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(COMPANY_PROBLEM_BY_ID("c1"));
  });

  test("deleteCompanyProblem resolves with undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteCompanyProblem("c1")).resolves.toBeUndefined();
  });

  test("deleteCompanyProblem propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteCompanyProblem("c1")).rejects.toThrow("Forbidden");
  });
});

describe("behavioral questions", () => {
  test("fetchBehavioralQuestions GETs the bare collection", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchBehavioralQuestions();
    expect(mockedAxios.get).toHaveBeenCalledWith(BEHAVIORAL_QUESTIONS);
  });

  test("fetchBehavioralQuestions returns the body unchanged", async () => {
    const questions = [{ id: "b1" }];
    mockedAxios.get.mockResolvedValue({ data: questions });
    await expect(fetchBehavioralQuestions()).resolves.toBe(questions);
  });

  test("fetchBehavioralQuestions propagates a rejection", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(fetchBehavioralQuestions()).rejects.toThrow("Forbidden");
  });

  test("createBehavioralQuestion POSTs the input verbatim to the collection", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "b1", ...behavioralQuestionInput } });
    await createBehavioralQuestion(behavioralQuestionInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(BEHAVIORAL_QUESTIONS, behavioralQuestionInput);
  });

  test("createBehavioralQuestion returns the created record", async () => {
    const created = { id: "b1", ...behavioralQuestionInput };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createBehavioralQuestion(behavioralQuestionInput)).resolves.toBe(created);
  });

  test("createBehavioralQuestion propagates a rejection", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Forbidden"));
    await expect(createBehavioralQuestion(behavioralQuestionInput)).rejects.toThrow("Forbidden");
  });

  test("updateBehavioralQuestion PUTs to the per-id sub-resource with the input verbatim", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "b1", ...behavioralQuestionInput } });
    await updateBehavioralQuestion("b1", behavioralQuestionInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      BEHAVIORAL_QUESTION_BY_ID("b1"),
      behavioralQuestionInput
    );
  });

  test("updateBehavioralQuestion returns the updated record", async () => {
    const updated = { id: "b1", ...behavioralQuestionInput, category: "leadership" };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateBehavioralQuestion("b1", behavioralQuestionInput)).resolves.toBe(updated);
  });

  test("updateBehavioralQuestion propagates a rejection", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateBehavioralQuestion("b1", behavioralQuestionInput)).rejects.toThrow(
      "Forbidden"
    );
  });

  test("deleteBehavioralQuestion DELETEs the per-id sub-resource", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteBehavioralQuestion("b1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(BEHAVIORAL_QUESTION_BY_ID("b1"));
  });

  test("deleteBehavioralQuestion resolves with undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteBehavioralQuestion("b1")).resolves.toBeUndefined();
  });

  test("deleteBehavioralQuestion propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteBehavioralQuestion("b1")).rejects.toThrow("Forbidden");
  });
});
