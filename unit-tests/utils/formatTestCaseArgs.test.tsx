import { formatTestCaseArgs } from "../../src/utils/formatTestCaseArgs";

describe("formatTestCaseArgs", () => {
  test("labels each positional argument with its parameter name", () => {
    expect(formatTestCaseArgs(["nums", "target"], [[2, 7, 11, 15], 9])).toBe(
      "nums = [2,7,11,15], target = 9"
    );
  });

  test("falls back to the raw JSON value for args with no matching param name", () => {
    expect(formatTestCaseArgs(["nums"], [[1, 2], 9])).toBe("nums = [1,2], 9");
  });

  test("formats every arg unlabelled when paramNames is undefined", () => {
    expect(formatTestCaseArgs(undefined, [1, "a", true])).toBe('1, "a", true');
  });

  test("formats every arg unlabelled when paramNames is an empty array", () => {
    expect(formatTestCaseArgs([], [1, 2])).toBe("1, 2");
  });

  test("returns an empty string when args is empty", () => {
    expect(formatTestCaseArgs(["nums"], [])).toBe("");
  });

  test("handles nested objects/arrays (e.g. a graph/tree-shaped argument)", () => {
    expect(formatTestCaseArgs(["root"], [{ val: 1, children: [2, 3] }])).toBe(
      'root = {"val":1,"children":[2,3]}'
    );
  });

  test("handles null and undefined values", () => {
    expect(formatTestCaseArgs(["a", "b"], [null, undefined])).toBe("a = null, b = undefined");
  });
});
