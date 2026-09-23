import { render, screen } from "@testing-library/react";
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

const renderTable = (fetchedProblems: CatalogProblem[]) =>
  render(
    <MemoryRouter>
      <CatalogTable
        isLoadingFetch={false}
        fetchedProblems={fetchedProblems}
        fetchNextPage={() => {}}
        hasNextPage={false}
        isFetchingNextPage={false}
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
});
