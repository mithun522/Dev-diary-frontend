import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import ErrorPage from "../../ErrorPage";
import { useDsaActivityHeatmap } from "../../../api/hooks/useFetchDsa";
import type { DailyActivity } from "../../../data/dsaProblemsData";
import { cn } from "../../../components/lib/utils";

// GitHub/LeetCode-style contribution heatmap: one box per day. GET /dsa/activity/heatmap always
// returns every day in the window (even zero-activity ones), so there are no gaps to fill in
// client-side.

// Shaded by total submissions (attempts), not just accepted ones - LeetCode/GitHub shade on
// activity, not just success, so a day with 3 failed attempts and 0 accepted still shows up as
// active rather than looking identical to a day with nothing done.
const LEVEL_THRESHOLDS = [0, 1, 3, 5, 7];
const LEVEL_COLORS = [
  "bg-muted", // 0 submissions - adapts to light/dark via the design token, unlike the fixed greens below
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// One "Last year" (rolling trailing 365 days, no `year` param) plus a couple of recent calendar
// years - mirrors GitHub's own year-tab selector next to its contribution graph.
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS: (number | "trailing")[] = ["trailing", CURRENT_YEAR, CURRENT_YEAR - 1];

const levelFor = (submissions: number) => {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (submissions >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};

type Cell = {
  date: string;
  accepted: number;
  submissions: number;
  catalogSubmissions: number;
  catalogAccepted: number;
  curriculumSubmissions: number;
  curriculumAccepted: number;
} | null;

// Chunks the (oldest-first) days into Sunday-aligned week columns, padding the first week with
// leading nulls so day-of-week rows line up the same way GitHub's calendar does.
const buildWeeks = (days: DailyActivity[]): Cell[][] => {
  if (days.length === 0) return [];

  const cells: Cell[] = days.map((d) => ({
    date: d.date,
    accepted: d.catalogAccepted + d.curriculumAccepted,
    submissions: d.catalogSubmissions + d.curriculumSubmissions,
    catalogSubmissions: d.catalogSubmissions,
    catalogAccepted: d.catalogAccepted,
    curriculumSubmissions: d.curriculumSubmissions,
    curriculumAccepted: d.curriculumAccepted,
  }));

  const firstDayOfWeek = new Date(`${days[0].date}T00:00:00`).getDay(); // 0 = Sunday
  const padded: Cell[] = [...Array(firstDayOfWeek).fill(null), ...cells];

  const weeks: Cell[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    const week = padded.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
};

// One label per week column: the month name, only on the first week that contains that month's
// 1st (or the very first column, so a mid-month start doesn't leave the calendar unlabeled).
const monthLabelsFor = (weeks: Cell[][]): (string | null)[] => {
  let lastMonth = -1;
  return weeks.map((week, index) => {
    const firstRealDay = week.find((c) => c !== null);
    if (!firstRealDay) return null;
    const month = new Date(`${firstRealDay.date}T00:00:00`).getMonth();
    const isNewMonth = month !== lastMonth;
    lastMonth = month;
    return isNewMonth || index === 0 ? MONTH_LABELS[month] : null;
  });
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const cellTitle = (cell: Cell) => {
  if (!cell) return undefined;
  if (cell.submissions === 0) return `No submissions on ${formatDate(cell.date)}`;
  return (
    `${cell.submissions} submissions (${cell.accepted} accepted) on ${formatDate(cell.date)} — ` +
    `Practice: ${cell.catalogSubmissions} submissions/${cell.catalogAccepted} accepted, ` +
    `Basics: ${cell.curriculumSubmissions} submissions/${cell.curriculumAccepted} accepted`
  );
};

const yearLabel = (year: number | "trailing") => (year === "trailing" ? "Last year" : String(year));

const ActivityHeatmap: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | "trailing">("trailing");
  const { data, isLoading, isError } = useDsaActivityHeatmap(
    selectedYear === "trailing" ? undefined : selectedYear
  );

  const weeks = useMemo(() => buildWeeks(data ?? []), [data]);
  const monthLabels = useMemo(() => monthLabelsFor(weeks), [weeks]);
  const { totalSubmissions, totalAccepted } = useMemo(
    () =>
      (data ?? []).reduce(
        (totals, d) => ({
          totalSubmissions: totals.totalSubmissions + d.catalogSubmissions + d.curriculumSubmissions,
          totalAccepted: totals.totalAccepted + d.catalogAccepted + d.curriculumAccepted,
        }),
        { totalSubmissions: 0, totalAccepted: 0 }
      ),
    [data]
  );

  if (isError) return <ErrorPage message="Failed to load activity heatmap" />;

  return (
    <Card data-cy="dsa-activity-heatmap">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            {isLoading || !data
              ? "Submissions over time"
              : `${totalSubmissions} submission${totalSubmissions === 1 ? "" : "s"} (${totalAccepted} accepted) in ${
                  selectedYear === "trailing" ? "the past year" : selectedYear
                }`}
          </CardDescription>
        </div>
        <div className="flex gap-1" data-cy="activity-heatmap-year-selector">
          {YEAR_OPTIONS.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              data-cy={`activity-heatmap-year-${year}`}
              className={cn(
                "rounded-md px-2 py-1 text-xs",
                selectedYear === year
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {yearLabel(year)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading || !data ? (
          <Skeleton className="h-[130px] w-full" />
        ) : (
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex flex-col gap-1 min-w-fit">
              <div className="flex gap-[3px] pl-6 text-xs text-muted-foreground">
                {monthLabels.map((label, i) => (
                  <div key={i} className="w-[11px] shrink-0">
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex gap-[3px]">
                <div className="flex flex-col gap-[3px] pr-1 text-xs text-muted-foreground">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                    <div key={i} className="h-[11px] leading-[11px]">
                      {label}
                    </div>
                  ))}
                </div>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((cell, dayIndex) => (
                      <div
                        key={dayIndex}
                        title={cellTitle(cell)}
                        data-cy={cell ? `activity-heatmap-day-${cell.date}` : undefined}
                        className={`h-[11px] w-[11px] rounded-sm ${
                          cell ? LEVEL_COLORS[levelFor(cell.submissions)] : "invisible"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-1 pt-1 text-xs text-muted-foreground">
                <span>Less</span>
                {LEVEL_COLORS.map((color, i) => (
                  <div key={i} className={`h-[11px] w-[11px] rounded-sm ${color}`} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
export { buildWeeks, monthLabelsFor, levelFor, cellTitle, LEVEL_THRESHOLDS, LEVEL_COLORS };
