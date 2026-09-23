jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchSystemDesignCases,
  createCase,
  updateCase,
  deleteCase,
  fetchScalabilityPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  type CaseInput,
  type PatternInput,
} from "../../../src/api/services/adminSystemDesign.service";
import {
  SYSTEM_DESIGN_CASES,
  SCALABILITY_PATTERNS,
  SYSTEM_DESIGN_API_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const CASE_INPUT: CaseInput = {
  title: "Design a URL shortener",
  summary: "Classic",
  techStack: ["redis", "postgres"],
  requirements: { functional: ["shorten"] },
};

const PATTERN_INPUT: PatternInput = {
  name: "Sharding",
  description: "Split data horizontally",
  useCases: ["large tables"],
  benefits: ["scales writes"],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("endpoint paths", () => {
  test("cases and patterns both live under system-design-service's /system-design namespace", () => {
    expect(SYSTEM_DESIGN_CASES).toBe(`${SYSTEM_DESIGN_API_URL}/system-design/cases`);
    expect(SCALABILITY_PATTERNS).toBe(`${SYSTEM_DESIGN_API_URL}/system-design/patterns`);
  });
});

// normalizeList is the only real branching logic in this service — it defends against the GET
// endpoints returning either a bare array or an envelope, so each branch is pinned.
describe("fetchSystemDesignCases — response normalization", () => {
  test("returns a bare array response as-is", async () => {
    const cases = [{ id: "c1", title: "A", techStack: [] }];
    mockedAxios.get.mockResolvedValue({ data: cases });
    await expect(fetchSystemDesignCases()).resolves.toEqual(cases);
  });

  test("unwraps an envelope keyed by 'cases'", async () => {
    const cases = [{ id: "c1", title: "A", techStack: [] }];
    mockedAxios.get.mockResolvedValue({ data: { cases } });
    await expect(fetchSystemDesignCases()).resolves.toEqual(cases);
  });

  test("returns [] for an envelope keyed by something else (e.g. 'patterns')", async () => {
    mockedAxios.get.mockResolvedValue({ data: { patterns: [{ id: "p1" }] } });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("returns [] when the body is null", async () => {
    mockedAxios.get.mockResolvedValue({ data: null });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("returns [] when the body is undefined", async () => {
    mockedAxios.get.mockResolvedValue({ data: undefined });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("returns [] when the keyed value is not an array", async () => {
    mockedAxios.get.mockResolvedValue({ data: { cases: "nope" } });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("returns [] for a primitive body", async () => {
    mockedAxios.get.mockResolvedValue({ data: 42 });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("preserves an empty array rather than treating it as missing", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await expect(fetchSystemDesignCases()).resolves.toEqual([]);
  });

  test("GETs the cases collection URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchSystemDesignCases();
    expect(mockedAxios.get).toHaveBeenCalledWith(SYSTEM_DESIGN_CASES);
  });

  test("propagates a rejection rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Service Unavailable"));
    await expect(fetchSystemDesignCases()).rejects.toThrow("Service Unavailable");
  });
});

describe("fetchScalabilityPatterns — response normalization", () => {
  test("returns a bare array response as-is", async () => {
    const patterns = [{ id: "p1", name: "Sharding", useCases: [], benefits: [] }];
    mockedAxios.get.mockResolvedValue({ data: patterns });
    await expect(fetchScalabilityPatterns()).resolves.toEqual(patterns);
  });

  test("unwraps an envelope keyed by 'patterns' (not 'cases')", async () => {
    const patterns = [{ id: "p1", name: "Sharding", useCases: [], benefits: [] }];
    mockedAxios.get.mockResolvedValue({ data: { patterns } });
    await expect(fetchScalabilityPatterns()).resolves.toEqual(patterns);
  });

  test("returns [] for an envelope keyed 'cases'", async () => {
    mockedAxios.get.mockResolvedValue({ data: { cases: [{ id: "c1" }] } });
    await expect(fetchScalabilityPatterns()).resolves.toEqual([]);
  });

  test("returns [] when the body is null", async () => {
    mockedAxios.get.mockResolvedValue({ data: null });
    await expect(fetchScalabilityPatterns()).resolves.toEqual([]);
  });

  test("GETs the patterns collection URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchScalabilityPatterns();
    expect(mockedAxios.get).toHaveBeenCalledWith(SCALABILITY_PATTERNS);
  });
});

describe("case writes", () => {
  test("createCase POSTs the payload to the collection URL", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "c1" } });
    await createCase(CASE_INPUT);
    expect(mockedAxios.post).toHaveBeenCalledWith(SYSTEM_DESIGN_CASES, CASE_INPUT);
  });

  test("createCase forwards free-form JSONB fields untouched", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createCase(CASE_INPUT);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect((body as CaseInput).requirements).toEqual({ functional: ["shorten"] });
  });

  test("createCase returns the created record", async () => {
    const created = { id: "c1", title: "A", techStack: [] };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createCase(CASE_INPUT)).resolves.toBe(created);
  });

  test("updateCase PUTs to the per-id URL", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateCase("c1", CASE_INPUT);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${SYSTEM_DESIGN_CASES}/c1`,
      CASE_INPUT
    );
  });

  test("updateCase returns the updated record", async () => {
    const updated = { id: "c1", title: "B", techStack: [] };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateCase("c1", CASE_INPUT)).resolves.toBe(updated);
  });

  test("deleteCase DELETEs the per-id URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteCase("c1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${SYSTEM_DESIGN_CASES}/c1`);
  });

  test("deleteCase resolves to undefined (void)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(deleteCase("c1")).resolves.toBeUndefined();
  });

  test("deleteCase propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Not Found"));
    await expect(deleteCase("missing")).rejects.toThrow("Not Found");
  });
});

describe("pattern writes", () => {
  test("createPattern POSTs the payload to the patterns collection URL", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createPattern(PATTERN_INPUT);
    expect(mockedAxios.post).toHaveBeenCalledWith(SCALABILITY_PATTERNS, PATTERN_INPUT);
  });

  test("createPattern does not post to the cases URL", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await createPattern(PATTERN_INPUT);
    const [url] = mockedAxios.post.mock.calls[0];
    expect(url).not.toBe(SYSTEM_DESIGN_CASES);
  });

  test("updatePattern PUTs to the per-id URL", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updatePattern("p1", PATTERN_INPUT);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${SCALABILITY_PATTERNS}/p1`,
      PATTERN_INPUT
    );
  });

  test("deletePattern DELETEs the per-id URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deletePattern("p1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${SCALABILITY_PATTERNS}/p1`);
  });

  test("deletePattern resolves to undefined (void)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(deletePattern("p1")).resolves.toBeUndefined();
  });
});
