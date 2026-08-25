import type { DailyProgress, DSAProblem } from "../data/dsaProblemsData";

/**
 * Buckets solved problems into the trailing 7 calendar days (today inclusive), keyed by
 * `updatedAt` — the timestamp that changes when a problem is marked SOLVED — since the backend
 * has no dedicated daily/weekly aggregate endpoint.
 */
export const computeWeeklyActivity = (problems: DSAProblem[]): DailyProgress[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: DailyProgress[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);

    const problemsSolved = problems.filter((problem) => {
      if (problem.status !== "SOLVED" || !problem.updatedAt) return false;

      const updatedAt = new Date(problem.updatedAt);
      return (
        updatedAt.getFullYear() === day.getFullYear() &&
        updatedAt.getMonth() === day.getMonth() &&
        updatedAt.getDate() === day.getDate()
      );
    }).length;

    days.push({ date: day.toISOString(), problemsSolved });
  }

  return days;
};
