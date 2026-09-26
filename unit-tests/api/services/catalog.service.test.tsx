jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchCatalogProblems,
  fetchCatalogProblemDetail,
  fetchCatalogProgress,
  fetchSubmissions,
  submitSolution,
  runSolution,
  generateTestCases,
} from "../../../src/api/services/catalog.service";
import { DSA_API_URL } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const CATALOG = `${DSA_API_URL}/catalog`;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchCatalogProblems", () => {
  test("requests the bare /catalog URL when no filters and no page are given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(CATALOG);
  });

  test("appends searchString when a search term is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("two sum", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}?searchString=two+sum`);
  });

  test("sends difficulty as the uppercase enum the Practice tab uses", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "EASY", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}?difficulty=EASY`);
  });

  test("appends pageNumber when a truthy page is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "", 2);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}?pageNumber=2`);
  });

  test("omits pageNumber for page 0 (falsy), so page 1 is implicit", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(CATALOG);
  });

  test("combines all three original params in a single query string", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("sum", "HARD", 3);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${CATALOG}?searchString=sum&difficulty=HARD&pageNumber=3`
    );
  });

  test("appends section as an exact-match query param when given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "", 0, "Dynamic Programming");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${CATALOG}?section=Dynamic+Programming`
    );
  });

  test("omits section entirely (not even as an empty param) when not given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(CATALOG);
  });

  test("combines search, difficulty, page, and section all together", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("sum", "HARD", 3, "Arrays");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${CATALOG}?searchString=sum&difficulty=HARD&pageNumber=3&section=Arrays`
    );
  });

  test("URL-encodes special characters in the search term", async () => {
    mockedAxios.get.mockResolvedValue({ data: { problems: [], totalLength: 0 } });
    await fetchCatalogProblems("a&b=c d", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}?searchString=a%26b%3Dc+d`);
  });

  test("returns the response body unchanged (CatalogProblemPage passthrough)", async () => {
    const page = { problems: [{ id: "p1" }], totalLength: 1 };
    mockedAxios.get.mockResolvedValue({ data: page });
    await expect(fetchCatalogProblems("", "", 1)).resolves.toBe(page);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchCatalogProblems("", "", 1)).rejects.toThrow("Network Error");
  });
});

describe("fetchCatalogProblemDetail", () => {
  test("requests /catalog/{id}", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: "p1" } });
    await fetchCatalogProblemDetail("p1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}/p1`);
  });

  test("returns the problem detail body", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: "p1", slug: "two-sum" } });
    await expect(fetchCatalogProblemDetail("p1")).resolves.toEqual({
      id: "p1",
      slug: "two-sum",
    });
  });
});

describe("fetchCatalogProgress", () => {
  test("requests /catalog/progress with no query params", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { totalProblems: 0, solvedProblems: 0, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
    });
    await fetchCatalogProgress();
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}/progress`);
  });

  test("returns the response body unchanged", async () => {
    const progress = {
      totalProblems: 10,
      solvedProblems: 3,
      solvedProblemIds: ["p1", "p2", "p3"],
      byDifficulty: [{ difficulty: "EASY", total: 10, solved: 3 }],
      byTopic: [{ topic: "ARRAY", total: 5, solved: 2 }],
    };
    mockedAxios.get.mockResolvedValue({ data: progress });
    await expect(fetchCatalogProgress()).resolves.toBe(progress);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchCatalogProgress()).rejects.toThrow("Network Error");
  });
});

describe("fetchSubmissions", () => {
  test("requests /catalog/{id}/submissions", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchSubmissions("p1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${CATALOG}/p1/submissions`);
  });

  test("returns the submissions array", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: "s1" }] });
    await expect(fetchSubmissions("p1")).resolves.toEqual([{ id: "s1" }]);
  });
});

describe("submitSolution", () => {
  test("POSTs { sourceCode, language } to /catalog/{id}/submissions", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "s1" } });
    await submitSolution("p1", "code", "python");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/submissions`, {
      sourceCode: "code",
      language: "python",
    });
  });

  test("defaults the language to javascript when not supplied", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await submitSolution("p1", "code");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/submissions`, {
      sourceCode: "code",
      language: "javascript",
    });
  });

  test("never sends returnType — it is a problem-level property resolved server-side", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await submitSolution("p1", "int main(){}", "cpp");
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(Object.keys(body as object).sort()).toEqual(["language", "sourceCode"]);
  });

  test.each(["javascript", "typescript", "python", "java", "c", "cpp"] as const)(
    "threads the %s language through to the request body",
    async (language) => {
      mockedAxios.post.mockResolvedValue({ data: {} });
      await submitSolution("p1", "code", language);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${CATALOG}/p1/submissions`,
        expect.objectContaining({ language })
      );
    }
  );
});

describe("runSolution", () => {
  test("POSTs { sourceCode, language } to /catalog/{id}/run", async () => {
    mockedAxios.post.mockResolvedValue({ data: { status: "ACCEPTED" } });
    await runSolution("p1", "code", "java");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/run`, {
      sourceCode: "code",
      language: "java",
    });
  });

  test("defaults the language to javascript", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await runSolution("p1", "code");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/run`, {
      sourceCode: "code",
      language: "javascript",
    });
  });

  test("returns the judge result body", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { status: "WRONG_ANSWER", results: [], runtimeMs: 12 },
    });
    await expect(runSolution("p1", "code")).resolves.toEqual({
      status: "WRONG_ANSWER",
      results: [],
      runtimeMs: 12,
    });
  });
});

describe("generateTestCases", () => {
  test("POSTs the reference solution and its language", async () => {
    mockedAxios.post.mockResolvedValue({ data: { testCases: [] } });
    await generateTestCases("p1", "function f(){}", "javascript");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/generate-test-cases`, {
      referenceSolution: "function f(){}",
      referenceSolutionLanguage: "javascript",
    });
  });

  test("includes referenceSolutionReturnType only when supplied (c/cpp)", async () => {
    mockedAxios.post.mockResolvedValue({ data: { testCases: [] } });
    await generateTestCases("p1", "int f(){}", "cpp", "int[]");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${CATALOG}/p1/generate-test-cases`, {
      referenceSolution: "int f(){}",
      referenceSolutionLanguage: "cpp",
      referenceSolutionReturnType: "int[]",
    });
  });

  test("unwraps testCases out of the GenerateTestCasesResult envelope", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { requested: 5, generated: 3, inserted: 3, testCases: [{ id: "tc1" }] },
    });
    await expect(generateTestCases("p1", "ref")).resolves.toEqual([{ id: "tc1" }]);
  });

  test("falls back to an empty array when the response has no testCases", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await expect(generateTestCases("p1", "ref")).resolves.toEqual([]);
  });

  test("falls back to an empty array when the response body is null", async () => {
    mockedAxios.post.mockResolvedValue({ data: null });
    await expect(generateTestCases("p1", "ref")).resolves.toEqual([]);
  });
});
