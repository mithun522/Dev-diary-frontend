import { computeWeeklyActivity } from "../../src/utils/computeWeeklyActivity";
import type { DSAProblem } from "../../src/data/dsaProblemsData";

const REQUIRED_FIELDS = {
  problem: "Two Sum",
  difficulty: "EASY" as const,
  language: "JAVASCRIPT" as const,
  topics: [],
  link: "",
};

const solvedOn = (isoDateTime: string): DSAProblem => ({
  ...REQUIRED_FIELDS,
  status: "SOLVED",
  updatedAt: isoDateTime,
});

describe("computeWeeklyActivity", () => {
  // "Today" is pinned so the trailing-7-day window is deterministic.
  const TODAY = new Date("2024-03-10T12:00:00Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns exactly 7 days, oldest first, today last", () => {
    const result = computeWeeklyActivity([]);
    expect(result).toHaveLength(7);
    expect(new Date(result[6].date).toDateString()).toBe(TODAY.toDateString());
  });

  test("every day has 0 problemsSolved when there are no problems", () => {
    const result = computeWeeklyActivity([]);
    expect(result.every((day) => day.problemsSolved === 0)).toBe(true);
  });

  test("counts a problem solved today on the last day only", () => {
    const problems = [solvedOn(TODAY.toISOString())];
    const result = computeWeeklyActivity(problems);
    expect(result[6].problemsSolved).toBe(1);
    expect(result.slice(0, 6).every((day) => day.problemsSolved === 0)).toBe(true);
  });

  test("counts multiple problems solved on the same day together", () => {
    const problems = [solvedOn(TODAY.toISOString()), solvedOn(TODAY.toISOString())];
    const result = computeWeeklyActivity(problems);
    expect(result[6].problemsSolved).toBe(2);
  });

  test("ignores a problem whose status is not SOLVED", () => {
    const problems: DSAProblem[] = [
      { ...REQUIRED_FIELDS, status: "ATTEMPTED", updatedAt: TODAY.toISOString() },
    ];
    const result = computeWeeklyActivity(problems);
    expect(result.every((day) => day.problemsSolved === 0)).toBe(true);
  });

  test("ignores a solved problem with no updatedAt", () => {
    const problems: DSAProblem[] = [{ ...REQUIRED_FIELDS, status: "SOLVED" }];
    const result = computeWeeklyActivity(problems);
    expect(result.every((day) => day.problemsSolved === 0)).toBe(true);
  });

  test("ignores a problem solved outside the trailing 7-day window", () => {
    const eightDaysAgo = new Date(TODAY);
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const problems = [solvedOn(eightDaysAgo.toISOString())];
    const result = computeWeeklyActivity(problems);
    expect(result.every((day) => day.problemsSolved === 0)).toBe(true);
  });

  test("buckets a problem solved 3 days ago into the correct day", () => {
    const threeDaysAgo = new Date(TODAY);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const problems = [solvedOn(threeDaysAgo.toISOString())];
    const result = computeWeeklyActivity(problems);
    // Index 6 is today, so 3 days ago is index 3.
    expect(result[3].problemsSolved).toBe(1);
    expect(
      result.filter((_, i) => i !== 3).every((day) => day.problemsSolved === 0)
    ).toBe(true);
  });
});
