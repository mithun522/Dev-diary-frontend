jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  createCatalogProblem,
  updateCatalogProblem,
  deleteCatalogProblem,
  type CatalogProblemInputPayload,
} from "../../../src/api/services/adminCatalog.service";
import { CATALOG, CATALOG_BY_ID } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

// Minimal, but real, CatalogProblemInputPayload — every field the backend's
// CatalogProblemInput schema requires (see adminCatalog.service.tsx's type comment).
const buildPayload = (
  overrides: Partial<CatalogProblemInputPayload> = {}
): CatalogProblemInputPayload => ({
  slug: "two-sum",
  title: "Two Sum",
  // NB: same uppercase enum ("EASY"/"MEDIUM"/"HARD") as catalog.service.tsx's fetchCatalogProblems
  // difficulty filter and PracticeTab's <SelectItem value="EASY">. This field is typed as
  // CatalogDifficulty here (compile-time restricted to that literal union), whereas
  // fetchCatalogProblems accepts a bare `difficulty: string` with no such restriction — see the
  // "difficulty" describe block below.
  difficulty: "EASY",
  topics: ["ARRAY", "HASHING"],
  description: "Given an array of integers, return indices of the two numbers that add to target.",
  functionName: "twoSum",
  paramNames: ["nums", "target"],
  starterCode: { javascript: "function twoSum(nums, target) {}" },
  returnType: "int[]",
  testCases: [{ args: [[2, 7, 11, 15], 9], expected: [0, 1], isSample: true }],
  ...overrides,
});

describe("createCatalogProblem", () => {
  test("POSTs the payload to the bare /catalog collection URL", async () => {
    const payload = buildPayload();
    mockedAxios.post.mockResolvedValue({ data: { id: "p1", ...payload, sampleTestCases: [] } });
    await createCatalogProblem(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith(CATALOG, payload);
  });

  test("sends the payload verbatim, without adding or stripping fields", async () => {
    const payload = buildPayload();
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createCatalogProblem(payload);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toBe(payload);
  });

  test("returns the created CatalogProblemDetail body", async () => {
    const detail = { id: "p1", ...buildPayload(), sampleTestCases: [] };
    mockedAxios.post.mockResolvedValue({ data: detail });
    await expect(createCatalogProblem(buildPayload())).resolves.toBe(detail);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Validation failed"));
    await expect(createCatalogProblem(buildPayload())).rejects.toThrow("Validation failed");
  });
});

describe("updateCatalogProblem", () => {
  test("PUTs to the per-problem /catalog/{id} URL", async () => {
    const payload = buildPayload();
    mockedAxios.put.mockResolvedValue({ data: { id: "p1", ...payload, sampleTestCases: [] } });
    await updateCatalogProblem("p1", payload);
    expect(mockedAxios.put).toHaveBeenCalledWith(CATALOG_BY_ID("p1"), payload);
    expect(CATALOG_BY_ID("p1")).toBe(`${CATALOG}/p1`);
  });

  test("interpolates the id into the URL path", async () => {
    const payload = buildPayload();
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateCatalogProblem("abc-123", payload);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${CATALOG}/abc-123`, payload);
  });

  test("never includes a testCases[].id — only args/expected/isSample", async () => {
    const payload = buildPayload({
      testCases: [{ args: [1], expected: 1, isSample: true }],
    });
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateCatalogProblem("p1", payload);
    const [, body] = mockedAxios.put.mock.calls[0] as [string, CatalogProblemInputPayload];
    expect(Object.keys(body.testCases[0]).sort()).toEqual(["args", "expected", "isSample"]);
  });

  test("returns the updated CatalogProblemDetail body", async () => {
    const detail = { id: "p1", ...buildPayload(), sampleTestCases: [] };
    mockedAxios.put.mockResolvedValue({ data: detail });
    await expect(updateCatalogProblem("p1", buildPayload())).resolves.toBe(detail);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Not Found"));
    await expect(updateCatalogProblem("missing", buildPayload())).rejects.toThrow("Not Found");
  });
});

describe("deleteCatalogProblem", () => {
  test("DELETEs the per-problem /catalog/{id} URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteCatalogProblem("p1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${CATALOG}/p1`);
  });

  test("resolves to undefined (no body to unwrap)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await expect(deleteCatalogProblem("p1")).resolves.toBeUndefined();
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteCatalogProblem("p1")).rejects.toThrow("Forbidden");
  });
});

describe("difficulty case contract vs. the user-facing catalog service", () => {
  // adminCatalog.service.tsx itself performs no case transformation on `difficulty` — it forwards
  // whatever the CatalogProblemInputPayload caller passes in, verbatim, the same as every other
  // field. The real inconsistency is in the *type* contract, not a runtime transform:
  //   - createCatalogProblem/updateCatalogProblem type `difficulty` as CatalogDifficulty, a
  //     compile-time-enforced uppercase literal union ("EASY" | "MEDIUM" | "HARD").
  //   - catalog.service.tsx's fetchCatalogProblems types its `difficulty` filter as a bare
  //     `string` with no case restriction at all (see catalog.service.test.tsx and
  //     dsa.service.test.tsx, which both prove the query-string path passes any case through
  //     unnormalised, e.g. "easy").
  // Both currently happen to be fed uppercase values by the UI, so there is no observed runtime
  // mismatch today — but nothing in either service enforces that at the boundary this test covers.
  test("forwards whatever-case difficulty string the caller supplies, unmodified", async () => {
    const payload = buildPayload({ difficulty: "EASY" });
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createCatalogProblem(payload);
    const [, body] = mockedAxios.post.mock.calls[0] as [string, CatalogProblemInputPayload];
    expect(body.difficulty).toBe("EASY");
  });
});
