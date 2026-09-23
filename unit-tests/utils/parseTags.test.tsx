import { parseTags } from "../../src/utils/parseTags";

describe("parseTags", () => {
  test("splits a comma-separated string into trimmed tags", () => {
    expect(parseTags("algorithms, data-structures,  javascript")).toEqual([
      "algorithms",
      "data-structures",
      "javascript",
    ]);
  });

  test("drops empty segments from leading/trailing/double commas", () => {
    expect(parseTags(",algorithms,,python,")).toEqual(["algorithms", "python"]);
  });

  test("returns an empty array for an empty string", () => {
    expect(parseTags("")).toEqual([]);
  });

  test("returns an empty array for a string of only commas/whitespace", () => {
    expect(parseTags(" , , ")).toEqual([]);
  });

  test("returns a single-element array when there are no commas", () => {
    expect(parseTags("backend")).toEqual(["backend"]);
  });
});
