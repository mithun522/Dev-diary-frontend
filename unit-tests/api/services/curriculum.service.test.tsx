jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
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
import { DSA_API_URL } from "../../../src/constants/Api";
import type {
  CurriculumTopicInput,
  CurriculumProblemInput,
  CurriculumTestCaseInput,
} from "../../../src/data/curriculumData";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const TOPICS = `${DSA_API_URL}/curriculum/topics`;
const PROBLEMS = `${DSA_API_URL}/curriculum/problems`;
const PROGRESS = `${DSA_API_URL}/curriculum/progress`;

const topicInput: CurriculumTopicInput = {
  slug: "print-output",
  title: "Print Output",
  description: "Learn to print",
};

const problemInput: CurriculumProblemInput = {
  slug: "hello-world",
  title: "Hello, World!",
  description: "Print it",
  language: "javascript",
  level: "beginner",
  starterCode: "console.log();",
  testCases: [{ expectedStdout: "Hello, World!", isSample: true }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("topics", () => {
  test("fetchCurriculumTopics GETs /curriculum/topics", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCurriculumTopics();
    expect(mockedAxios.get).toHaveBeenCalledWith(TOPICS);
  });

  test("fetchCurriculumTopics returns response.data", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "t1" }] });
    await expect(fetchCurriculumTopics()).resolves.toEqual([{ id: "t1" }]);
  });

  test("fetchCurriculumTopics propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("500"));
    await expect(fetchCurriculumTopics()).rejects.toThrow("500");
  });

  test("createCurriculumTopic POSTs the payload to /curriculum/topics", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "t1" } });
    await createCurriculumTopic(topicInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(TOPICS, topicInput);
  });

  test("createCurriculumTopic forwards afterTopicId: null (place first) without dropping it", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    const withPosition: CurriculumTopicInput = { ...topicInput, afterTopicId: null };
    await createCurriculumTopic(withPosition);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toEqual(withPosition);
    expect((body as CurriculumTopicInput).afterTopicId).toBeNull();
  });

  test("createCurriculumTopic returns the created topic", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "t1", slug: "print-output" } });
    await expect(createCurriculumTopic(topicInput)).resolves.toEqual({
      id: "t1",
      slug: "print-output",
    });
  });

  test("updateCurriculumTopic PUTs to /curriculum/topics/{id}", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateCurriculumTopic("t1", topicInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${TOPICS}/t1`, topicInput);
  });

  test("updateCurriculumTopic returns the updated topic", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "t1", title: "Renamed" } });
    await expect(updateCurriculumTopic("t1", topicInput)).resolves.toEqual({
      id: "t1",
      title: "Renamed",
    });
  });

  test("deleteCurriculumTopic DELETEs /curriculum/topics/{id} with no body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteCurriculumTopic("t1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${TOPICS}/t1`);
    expect(mockedAxios.delete.mock.calls[0]).toHaveLength(1);
  });

  test("deleteCurriculumTopic resolves to undefined, discarding any response body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(deleteCurriculumTopic("t1")).resolves.toBeUndefined();
  });

  test("deleteCurriculumTopic propagates a rejected request", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("409"));
    await expect(deleteCurriculumTopic("t1")).rejects.toThrow("409");
  });
});

describe("fetchCurriculumProblems", () => {
  test("GETs the topic's problems with no query string when no language is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCurriculumProblems("t1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TOPICS}/t1/problems`);
  });

  test("appends ?language= when a language is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCurriculumProblems("t1", "python");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TOPICS}/t1/problems?language=python`);
  });

  test.each(["javascript", "typescript", "python", "java", "c", "cpp"] as const)(
    "threads the %s language into the query string",
    async (language) => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      await fetchCurriculumProblems("t1", language);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${TOPICS}/t1/problems?language=${language}`
      );
    }
  );

  test("returns response.data", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "p1", solved: true }] });
    await expect(fetchCurriculumProblems("t1")).resolves.toEqual([
      { id: "p1", solved: true },
    ]);
  });

  test("propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("404"));
    await expect(fetchCurriculumProblems("nope")).rejects.toThrow("404");
  });
});

describe("problem CRUD", () => {
  test("createCurriculumProblem POSTs to the topic's problems collection", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createCurriculumProblem("t1", problemInput);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${TOPICS}/t1/problems`, problemInput);
  });

  test("createCurriculumProblem nests the new problem under its topic, not under /curriculum/problems", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createCurriculumProblem("t1", problemInput);
    const [url] = mockedAxios.post.mock.calls[0];
    expect(url).not.toBe(PROBLEMS);
  });

  test("createCurriculumProblem returns the created problem", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "p1" } });
    await expect(createCurriculumProblem("t1", problemInput)).resolves.toEqual({ id: "p1" });
  });

  test("fetchCurriculumProblemDetail GETs /curriculum/problems/{id}", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCurriculumProblemDetail("p1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${PROBLEMS}/p1`);
  });

  test("fetchCurriculumProblemDetail returns the detail including sampleTestCases and solved", async () => {
    const detail = { id: "p1", solved: false, sampleTestCases: [{ id: "tc1" }] };
    mockedAxios.get.mockResolvedValue({ data: detail });
    await expect(fetchCurriculumProblemDetail("p1")).resolves.toEqual(detail);
  });

  test("updateCurriculumProblem PUTs to /curriculum/problems/{id} (flat, not nested under topic)", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateCurriculumProblem("p1", problemInput);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${PROBLEMS}/p1`, problemInput);
  });

  test("updateCurriculumProblem returns the updated problem", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "p1", title: "New" } });
    await expect(updateCurriculumProblem("p1", problemInput)).resolves.toEqual({
      id: "p1",
      title: "New",
    });
  });

  test("deleteCurriculumProblem DELETEs /curriculum/problems/{id} with no body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteCurriculumProblem("p1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${PROBLEMS}/p1`);
    expect(mockedAxios.delete.mock.calls[0]).toHaveLength(1);
  });

  test("deleteCurriculumProblem resolves to undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(deleteCurriculumProblem("p1")).resolves.toBeUndefined();
  });
});

describe("replaceCurriculumTestCases", () => {
  const cases: CurriculumTestCaseInput[] = [
    { expectedStdout: "1", isSample: true },
    { expectedStdout: "2" },
  ];

  test("PUTs to /curriculum/problems/{id}/test-cases", async () => {
    mockedAxios.put.mockResolvedValue({ data: [] });
    await replaceCurriculumTestCases("p1", cases);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${PROBLEMS}/p1/test-cases`,
      expect.anything()
    );
  });

  test("wraps the array in a { testCases } envelope rather than sending a bare array", async () => {
    mockedAxios.put.mockResolvedValue({ data: [] });
    await replaceCurriculumTestCases("p1", cases);
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(body).toEqual({ testCases: cases });
    expect(Array.isArray(body)).toBe(false);
  });

  test("forwards an empty array as { testCases: [] } (server decides whether to reject)", async () => {
    mockedAxios.put.mockResolvedValue({ data: [] });
    await replaceCurriculumTestCases("p1", []);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${PROBLEMS}/p1/test-cases`, {
      testCases: [],
    });
  });

  test("returns the persisted test cases from response.data", async () => {
    mockedAxios.put.mockResolvedValue({ data: [{ id: "tc1", expectedStdout: "1", isSample: true }] });
    await expect(replaceCurriculumTestCases("p1", cases)).resolves.toEqual([
      { id: "tc1", expectedStdout: "1", isSample: true },
    ]);
  });
});

describe("run / submit", () => {
  test("runCurriculumSolution POSTs to /curriculum/problems/{id}/run", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await runCurriculumSolution("p1", "print(1)");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${PROBLEMS}/p1/run`, {
      sourceCode: "print(1)",
    });
  });

  test("runCurriculumSolution sends NO language field (it is fixed per curriculum problem)", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await runCurriculumSolution("p1", "print(1)");
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["sourceCode"]);
  });

  test("runCurriculumSolution returns the judge result", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { status: "ACCEPTED", results: [], runtimeMs: 7 },
    });
    await expect(runCurriculumSolution("p1", "code")).resolves.toEqual({
      status: "ACCEPTED",
      results: [],
      runtimeMs: 7,
    });
  });

  test("submitCurriculumSolution POSTs to /curriculum/problems/{id}/submissions", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await submitCurriculumSolution("p1", "print(1)");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${PROBLEMS}/p1/submissions`, {
      sourceCode: "print(1)",
    });
  });

  test("submitCurriculumSolution hits a different endpoint from run (persisting vs not)", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await runCurriculumSolution("p1", "code");
    await submitCurriculumSolution("p1", "code");
    const [runUrl] = mockedAxios.post.mock.calls[0];
    const [submitUrl] = mockedAxios.post.mock.calls[1];
    expect(runUrl).not.toBe(submitUrl);
  });

  test("submitCurriculumSolution sends only sourceCode", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await submitCurriculumSolution("p1", "code");
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["sourceCode"]);
  });

  test("submitCurriculumSolution propagates a rejected request", async () => {
    mockedAxios.post.mockRejectedValue(new Error("502"));
    await expect(submitCurriculumSolution("p1", "code")).rejects.toThrow("502");
  });

  test("fetchCurriculumSubmissions GETs the same /submissions URL that submit POSTs to", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCurriculumSubmissions("p1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${PROBLEMS}/p1/submissions`);
  });

  test("fetchCurriculumSubmissions returns the submissions array", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "s1", status: "ACCEPTED" }] });
    await expect(fetchCurriculumSubmissions("p1")).resolves.toEqual([
      { id: "s1", status: "ACCEPTED" },
    ]);
  });
});

describe("fetchCurriculumProgress", () => {
  test("GETs /curriculum/progress with no query string when no language is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCurriculumProgress();
    expect(mockedAxios.get).toHaveBeenCalledWith(PROGRESS);
  });

  test("appends ?language= when a language is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCurriculumProgress("java");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${PROGRESS}?language=java`);
  });

  test("sends no userId param — the endpoint is always scoped to the authenticated caller", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCurriculumProgress("python");
    const [url] = mockedAxios.get.mock.calls[0];
    expect(url).not.toMatch(/userId/i);
  });

  test("returns the progress rollup body", async () => {
    const progress = {
      totalProblems: 42,
      solvedProblems: 12,
      solvedProblemIds: ["p1"],
      byTopic: [],
    };
    mockedAxios.get.mockResolvedValue({ data: progress });
    await expect(fetchCurriculumProgress()).resolves.toEqual(progress);
  });

  test("propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("401"));
    await expect(fetchCurriculumProgress()).rejects.toThrow("401");
  });
});
