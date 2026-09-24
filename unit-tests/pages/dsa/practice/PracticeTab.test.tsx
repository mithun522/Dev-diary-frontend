import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PracticeTab from "../../../../src/pages/dsa/practice/PracticeTab";
import { useFetchCatalogProblemsPaged } from "../../../../src/api/hooks/useFetchCatalog";
import { useDebounce } from "../../../../src/api/hooks/use-debounce";
import type { CatalogProblem } from "../../../../src/data/catalogData";

jest.mock("../../../../src/api/hooks/useFetchCatalog", () => ({
  useFetchCatalogProblemsPaged: jest.fn(),
}));

// The real hook waits 1000ms before committing a search value; mocked as an identity pass-through
// so filter wiring can be asserted synchronously instead of racing fake timers.
jest.mock("../../../../src/api/hooks/use-debounce", () => ({
  useDebounce: jest.fn((value: unknown) => value),
}));

const mockedUseFetchCatalogProblems = useFetchCatalogProblemsPaged as jest.Mock;
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
  data: { problems: [buildProblem()], totalLength: 1 },
  totalPages: 1,
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

  test("fetches page 1 with empty search/difficulty/section on first render", () => {
    renderPracticeTab();
    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "",
      section: "",
      page: 1,
    });
  });

  test("renders the loading state from CatalogTable while the query is loading", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(defaultQueryResult({ isLoading: true, data: undefined }));
    const { container } = renderPracticeTab();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("renders CatalogTable's empty state when there are no problems", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(
      defaultQueryResult({ data: { problems: [], totalLength: 0 }, totalPages: 0 })
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
      section: "",
      page: 1,
    });
  });

  // Render order in PracticeTab is Topic (section) select, then Difficulty select - so
  // getAllByRole("combobox") is [sectionTrigger, difficultyTrigger] in that order.
  test("selecting a difficulty from the filter re-queries with that difficulty", async () => {
    renderPracticeTab();

    const [, difficultyTrigger] = screen.getAllByRole("combobox");
    expect(difficultyTrigger).toHaveTextContent("All");

    fireEvent.click(difficultyTrigger);
    const easyOption = await screen.findByRole("option", { name: "Easy" });
    fireEvent.click(easyOption);

    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "EASY",
      section: "",
      page: 1,
    });
  });

  test("selecting a topic from the section filter re-queries with that section", async () => {
    renderPracticeTab();

    const [sectionTrigger] = screen.getAllByRole("combobox");
    expect(sectionTrigger).toHaveTextContent("Topic");

    fireEvent.click(sectionTrigger);
    const graphsOption = await screen.findByRole("option", { name: "Graphs" });
    fireEvent.click(graphsOption);

    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "",
      section: "Graphs",
      page: 1,
    });
  });

  test("navigating to page 2 then changing the difficulty filter resets back to page 1", async () => {
    // totalPages: 3 so Pagination actually renders a page-2 button to click.
    mockedUseFetchCatalogProblems.mockReturnValue(defaultQueryResult({ totalPages: 3 }));
    renderPracticeTab();

    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );

    const [, difficultyTrigger] = screen.getAllByRole("combobox");
    fireEvent.click(difficultyTrigger);
    const hardOption = await screen.findByRole("option", { name: "Hard" });
    fireEvent.click(hardOption);

    expect(mockedUseFetchCatalogProblems).toHaveBeenLastCalledWith({
      search: "",
      difficulty: "HARD",
      section: "",
      page: 1,
    });
  });

  test("passes the fetched problems through to CatalogTable for rendering", () => {
    mockedUseFetchCatalogProblems.mockReturnValue(
      defaultQueryResult({
        data: { problems: [buildProblem({ title: "Valid Parentheses" })], totalLength: 1 },
      })
    );
    renderPracticeTab();
    expect(screen.getByText("Valid Parentheses")).toBeInTheDocument();
  });
});
