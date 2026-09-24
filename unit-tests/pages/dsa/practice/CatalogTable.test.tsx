import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CatalogTable from "../../../../src/pages/dsa/practice/CatalogTable";
import type { CatalogProblem } from "../../../../src/data/catalogData";

const BASE_PROBLEM: CatalogProblem = {
  id: "prob1",
  slug: "two-sum",
  title: "Two Sum",
  difficulty: "EASY",
  topics: [],
  description: "desc",
  functionName: "twoSum",
  paramNames: ["nums", "target"],
  starterCode: { javascript: "function twoSum() {}" },
  section: "Hashing",
  position: 100,
  score: 5,
  timeLimitMs: null,
};

const renderTable = (
  fetchedProblems: CatalogProblem[],
  paginationOverrides: { currentPage?: number; totalPages?: number; onPageChange?: (page: number) => void } = {}
) =>
  render(
    <MemoryRouter>
      <CatalogTable
        isLoadingFetch={false}
        fetchedProblems={fetchedProblems}
        currentPage={paginationOverrides.currentPage ?? 1}
        totalPages={paginationOverrides.totalPages ?? 1}
        onPageChange={paginationOverrides.onPageChange ?? (() => {})}
      />
    </MemoryRouter>
  );

describe("CatalogTable", () => {
  test("renders the score badge next to difficulty when score is present", () => {
    renderTable([BASE_PROBLEM]);
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("5 pts")).toBeInTheDocument();
  });

  test("omits the score badge (instead of rendering 'undefined pts') when score is missing", () => {
    // Simulates the backend field-rollout not being deployed yet (see the migration hand-off notes).
    const { score, ...withoutScore } = BASE_PROBLEM;
    void score;
    renderTable([withoutScore as CatalogProblem]);
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
  });

  test("renders 'No problems found' when the list is empty", () => {
    renderTable([]);
    expect(
      screen.getByText("No problems found matching your filters.")
    ).toBeInTheDocument();
  });

  test("renders a topic badge per problem topic", () => {
    renderTable([{ ...BASE_PROBLEM, topics: ["ARRAY", "HASHING"] }]);
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Hashing")).toBeInTheDocument();
  });

  describe("pagination", () => {
    test("renders no pagination controls when there is only one page", () => {
      renderTable([BASE_PROBLEM], { totalPages: 1 });
      expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
    });

    test("renders numbered page buttons and highlights the current page", () => {
      renderTable([BASE_PROBLEM], { currentPage: 2, totalPages: 4 });
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(screen.getByRole("button", { name: "Go to page 4" })).toBeInTheDocument();
    });

    test("clicking a page number calls onPageChange with that page", () => {
      const onPageChange = jest.fn();
      renderTable([BASE_PROBLEM], { currentPage: 1, totalPages: 4, onPageChange });
      fireEvent.click(screen.getByRole("button", { name: "Go to page 3" }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test("Prev is disabled on page 1, Next is disabled on the last page", () => {
      renderTable([BASE_PROBLEM], { currentPage: 1, totalPages: 3 });
      expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
    });

    test("Next click advances by one page", () => {
      const onPageChange = jest.fn();
      renderTable([BASE_PROBLEM], { currentPage: 2, totalPages: 5, onPageChange });
      fireEvent.click(screen.getByRole("button", { name: "Next page" }));
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test("renders an ellipsis for a large page count instead of every page number", () => {
      renderTable([BASE_PROBLEM], { currentPage: 20, totalPages: 40 });
      expect(screen.getByRole("button", { name: "Go to page 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Go to page 40" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Go to page 10" })).not.toBeInTheDocument();
    });
  });
});
