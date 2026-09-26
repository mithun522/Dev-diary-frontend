import { render, screen } from "@testing-library/react";
import ActivityHeatmap, {
  buildWeeks,
  cellTitle,
  levelFor,
  monthLabelsFor,
} from "../../../../src/pages/dsa/progress/ActivityHeatmap";
import { useDsaActivityHeatmap } from "../../../../src/api/hooks/useFetchDsa";
import type { DailyActivity } from "../../../../src/data/dsaProblemsData";

jest.mock("../../../../src/api/hooks/useFetchDsa", () => ({
  useDsaActivityHeatmap: jest.fn(),
}));

const mockedUseDsaActivityHeatmap = useDsaActivityHeatmap as jest.Mock;

const day = (date: string, overrides: Partial<DailyActivity> = {}): DailyActivity => ({
  date,
  catalogSubmissions: 0,
  catalogAccepted: 0,
  curriculumSubmissions: 0,
  curriculumAccepted: 0,
  ...overrides,
});

describe("levelFor", () => {
  test("returns level 0 for zero accepted", () => {
    expect(levelFor(0)).toBe(0);
  });

  test.each([
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 2],
    [5, 3],
    [6, 3],
    [7, 4],
    [20, 4],
  ])("maps %i accepted to level %i", (accepted, expected) => {
    expect(levelFor(accepted)).toBe(expected);
  });
});

describe("buildWeeks", () => {
  test("returns an empty array for no days", () => {
    expect(buildWeeks([])).toEqual([]);
  });

  test("pads the first week with leading nulls so days line up under the right weekday", () => {
    // 2026-09-24 is a Thursday (day-of-week 4) -> 4 leading nulls before it.
    const weeks = buildWeeks([day("2026-09-24")]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0][4]?.date).toBe("2026-09-24");
    expect(weeks[0].slice(5)).toEqual([null, null]);
  });

  test("chunks a full week with no padding into a single 7-cell week starting Sunday", () => {
    // 2026-09-20 is a Sunday.
    const dates = [
      "2026-09-20",
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
    ];
    const weeks = buildWeeks(dates.map((d) => day(d)));
    expect(weeks).toHaveLength(1);
    expect(weeks[0].every((c) => c !== null)).toBe(true);
  });

  test("trailing partial week is padded to 7 with trailing nulls", () => {
    // 2026-09-20 (Sun) through 2026-09-22 (Tue) - 3 days, one partial week.
    const weeks = buildWeeks([day("2026-09-20"), day("2026-09-21"), day("2026-09-22")]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].slice(0, 3).every((c) => c !== null)).toBe(true);
    expect(weeks[0].slice(3)).toEqual([null, null, null, null]);
  });

  test("carries catalog/curriculum accepted and submissions through onto each cell", () => {
    const weeks = buildWeeks([
      day("2026-09-24", {
        catalogAccepted: 2,
        curriculumAccepted: 1,
        catalogSubmissions: 3,
        curriculumSubmissions: 2,
      }),
    ]);
    const cell = weeks[0].find((c) => c?.date === "2026-09-24");
    expect(cell).toMatchObject({
      accepted: 3,
      submissions: 5,
      catalogAccepted: 2,
      curriculumAccepted: 1,
    });
  });
});

describe("monthLabelsFor", () => {
  test("labels the very first week even mid-month", () => {
    const weeks = buildWeeks([day("2026-09-24")]);
    expect(monthLabelsFor(weeks)).toEqual(["Sep"]);
  });

  test("labels only the first week of each new month, not every week", () => {
    // Aug 30 (Sun) through Sep 12 - two weeks, second week starts the new month.
    const weeks = buildWeeks([
      day("2026-08-30"),
      day("2026-08-31"),
      day("2026-09-01"),
      day("2026-09-02"),
      day("2026-09-03"),
      day("2026-09-04"),
      day("2026-09-05"),
      day("2026-09-06"),
      day("2026-09-07"),
      day("2026-09-08"),
      day("2026-09-09"),
      day("2026-09-10"),
      day("2026-09-11"),
      day("2026-09-12"),
    ]);
    expect(monthLabelsFor(weeks)).toEqual(["Aug", "Sep"]);
  });
});

describe("cellTitle", () => {
  test("returns undefined for a null (padding) cell", () => {
    expect(cellTitle(null)).toBeUndefined();
  });

  test("reports no submissions when accepted is 0", () => {
    const cell = buildWeeks([day("2026-09-24")])[0].find((c) => c !== null);
    expect(cellTitle(cell ?? null)).toMatch(/No submissions on/);
  });

  test("breaks down accepted/submissions by practice vs basics", () => {
    const cell = buildWeeks([
      day("2026-09-24", {
        catalogAccepted: 2,
        curriculumAccepted: 1,
        catalogSubmissions: 3,
        curriculumSubmissions: 1,
      }),
    ])[0].find((c) => c !== null);
    expect(cellTitle(cell ?? null)).toBe(
      "3 accepted (4 submissions) on Sep 24, 2026 — Practice: 2, Basics: 1"
    );
  });
});

describe("ActivityHeatmap component", () => {
  beforeEach(() => {
    mockedUseDsaActivityHeatmap.mockReset();
  });

  test("renders a loading skeleton while the hook is loading", () => {
    mockedUseDsaActivityHeatmap.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<ActivityHeatmap />);
    expect(screen.getByText("Accepted submissions over the past year")).toBeInTheDocument();
  });

  test("renders an error page when the hook errors", () => {
    mockedUseDsaActivityHeatmap.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<ActivityHeatmap />);
    expect(screen.getByText("Failed to load activity heatmap")).toBeInTheDocument();
  });

  test("summarizes the total accepted count across the whole dataset", () => {
    mockedUseDsaActivityHeatmap.mockReturnValue({
      data: [
        day("2026-09-23", { catalogAccepted: 2 }),
        day("2026-09-24", { curriculumAccepted: 3 }),
      ],
      isLoading: false,
      isError: false,
    });
    render(<ActivityHeatmap />);
    expect(screen.getByText("5 accepted submissions in the past year")).toBeInTheDocument();
  });

  test("uses singular phrasing for exactly 1 accepted submission", () => {
    mockedUseDsaActivityHeatmap.mockReturnValue({
      data: [day("2026-09-24", { catalogAccepted: 1 })],
      isLoading: false,
      isError: false,
    });
    render(<ActivityHeatmap />);
    expect(screen.getByText("1 accepted submission in the past year")).toBeInTheDocument();
  });

  test("renders one titled box per real day returned by the hook", () => {
    mockedUseDsaActivityHeatmap.mockReturnValue({
      data: [day("2026-09-24", { catalogAccepted: 1 })],
      isLoading: false,
      isError: false,
    });
    render(<ActivityHeatmap />);
    expect(document.querySelector('[data-cy="activity-heatmap-day-2026-09-24"]')).not.toBeNull();
  });
});
