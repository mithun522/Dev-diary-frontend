import { formatDate } from "../../src/utils/formatDate";

describe("formatDate", () => {
  test("formats an ISO date string as 'Mon D, YYYY'", () => {
    expect(formatDate("2024-03-05T00:00:00Z")).toBe("Mar 5, 2024");
  });

  test("returns an empty string when given undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  test("returns an empty string when given null", () => {
    expect(formatDate(null)).toBe("");
  });

  test("returns an empty string for an empty string", () => {
    expect(formatDate("")).toBe("");
  });

  test("returns an empty string for an unparsable date string", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});
