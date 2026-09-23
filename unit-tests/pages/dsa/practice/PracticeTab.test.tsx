import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PracticeTab from "../../../../src/pages/dsa/practice/PracticeTab";
import { useFetchCatalogProblems } from "../../../../src/api/hooks/useFetchCatalog";
import { useDebounce } from "../../../../src/api/hooks/use-debounce";
import type { CatalogProblem } from "../../../../src/data/catalogData";

jest.mock("../../../../src/api/hooks/useFetchCatalog", () => ({
  useFetchCatalogProblems: jest.fn(),
}));

// The real hook waits 1000ms before committing a search value; mocked as an identity pass-through
// so filter wiring can be asserted synchronously instead of racing fake timers.
jest.mock("../../../../src/api/hooks/use-debounce", () => ({
  useDebounce: jest.fn((value: unknown) => value),
}));

const mockedUseFetchCatalogProblems = useFetchCatalogProblems as jest.Mock;
const mockedUseDebounce = useDebounce as jest.Mock;

const buildProblem = (overrides: Partial<CatalogProblem> = {}): CatalogProblem => ({
  id: "prob-1",
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  topics: [],
  description: "desc",
  functionName: "twoSum",
  paramNames: ["nums", "target"],
  starterCode: { javascript: "function twoSum() {}" },
  section: null,
  position: null,
  timeLimitMs: null,
  ...overrides,
});

const defaultQueryResult = (overrides: Record<string, unknown> = {}) => ({
  data: { pages: [{ problems: [buildProblem()], totalLength: 1 }] },
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
  isLoading: false,
  error: null,
  ...overrides,
});

const renderPracticeTab = () =>
  render(
    <MemoryRouter>
      <PracticeTab />
    </MemoryRouter>
  );

describe("PracticeTab", () => {
  beforeEach(() => {
    mockedUseFetchCatalogProblems.mockReset();
    mockedUseDebounce.mockClear();
    mockedUseFetchCatalogProblems.mockReturnValue(defaultQueryResult());

    // jsdom implements neither of these, and Radix Select's focus-restore logic calls
    // `scrollIntoView` on open — without a stub the click that opens the dropdown throws.
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = jest.fn();
    }
    if (!Element.prototype.hasPointerCapture) {
      // @ts-expect-error -- jsdom doesn't implement pointer capture.
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.releasePointerCapture) {
      // @ts-expect-error -- jsdom doesn't implement pointer capture.
      Element.prototype.releasePointerCapture = () => {};
    }
  });

  test("fetches with empty search/difficulty on first render", () => {
    renderPracticeTab();
    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "",
    });
  });

  test("renders the loading state from CatalogTable while the query is loading", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(defaultQueryResult({ isLoading: true, data: undefined }));
    const { container } = renderPracticeTab();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("renders CatalogTable's empty state when there are no problems", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(
      defaultQueryResult({ data: { pages: [{ problems: [], totalLength: 0 }] } })
    );
    renderPracticeTab();
    expect(
      screen.getByText("No problems found matching your filters.")
    ).toBeInTheDocument();
  });

  test("renders an error page when the query fails", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(
      defaultQueryResult({ error: new Error("boom") })
    );
    renderPracticeTab();
    expect(screen.getByText("Failed to fetch practice problems")).toBeInTheDocument();
  });

  test("typing in the search box re-queries with the typed search term", () => {
    renderPracticeTab();
    fireEvent.change(screen.getByPlaceholderText("Search problems by title or tag..."), {
      target: { value: "two sum" },
    });

    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "two sum",
      difficulty: "",
    });
  });

  test("selecting a difficulty from the filter re-queries with that difficulty", async () => {
    renderPracticeTab();

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("All");

    fireEvent.click(trigger);
    const easyOption = await screen.findByRole("option", { name: "Easy" });
    fireEvent.click(easyOption);

    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "EASY",
    });
  });

  test("passes the fetched problems through to CatalogTable for rendering", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(
      defaultQueryResult({
        data: { pages: [{ problems: [buildProblem({ title: "Valid Parentheses" })], totalLength: 1 }] },
      })
    );
    renderPracticeTab();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
  });
});
