import { fireEvent, render, screen } from "@testing-library/react";
import DsaTable from "../../../src/pages/dsa/DsaTable";
import type { DSAProblem } from "../../../src/data/dsaProblemsData";
import { formatDate } from "../../../src/utils/formatDate";

const buildProblem = (overrides: Partial<DSAProblem> = {}): DSAProblem => ({
  id: "p1",
  problem: "Two Sum",
  difficulty: "EASY",
  language: "JAVASCRIPT",
  topics: ["ARRAY", "HASHING"],
  link: "https://leetcode.com/problems/two-sum",
  status: "SOLVED",
  createdAt: "2024-03-10T12:00:00.000Z",
  ...overrides,
});

const noop = () => {};

const renderTable = (props: Partial<React.ComponentProps<typeof DsaTable>> = {}) =>
  render(
    <DsaTable
      isLoadingFetch={false}
      isFetching={false}
      errorFetch={null}
      fetchedProblems={[buildProblem()]}
      setIsOpenConfirmationModal={noop}
      setSelectedProblem={noop}
      setIsSolutionModalOpen={noop}
      isFormModalOpen={false}
      setIsFormModalOpen={noop}
      setProblemData={noop}
      fetchNextPage={noop}
      hasNextPage={false}
      isFetchingNextPage={false}
      {...props}
    />
  );

describe("DsaTable", () => {
  test("renders a loading skeleton row set while fetching", () => {
    const { container } = renderTable({ isLoadingFetch: true, fetchedProblems: [] });
    // 5 skeleton rows x 6 cells each.
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(30);
  });

  test("renders no rows (and no crash) when the list is empty", () => {
    // NOTE: DsaTable's fallback branch is gated on `fetchedProblems ? ... : <empty message>`,
    // and an empty array is truthy, so the "No problems found" row is unreachable in practice
    // (see bug reported alongside this test suite). This asserts the actual current behavior.
    const { container } = renderTable({ fetchedProblems: [] });
    expect(container.querySelectorAll('[data-cy="dsa-row"]')).toHaveLength(0);
    expect(screen.queryByText(/No problems found/)).not.toBeInTheDocument();
  });

  test("renders the problem title as a link, difficulty badge, topic badges, status and date", () => {
    const problem = buildProblem();
    renderTable({ fetchedProblems: [problem] });

    const link = screen.getByRole("link", { name: "Two Sum" });
    expect(link).toHaveAttribute("href", problem.link);
    expect(link).toHaveAttribute("target", "_blank");

    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Hashing")).toBeInTheDocument();
    expect(screen.getByText("SOLVED")).toBeInTheDocument();
    expect(screen.getByText(formatDate(problem.createdAt))).toBeInTheDocument();
  });

  test("renders a dash for last-solved date when createdAt is missing", () => {
    renderTable({ fetchedProblems: [buildProblem({ createdAt: undefined })] });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("clicking a row selects the problem and opens the solution modal", () => {
    const setSelectedProblem = jest.fn();
    const setIsSolutionModalOpen = jest.fn();
    const problem = buildProblem();
    renderTable({
      fetchedProblems: [problem],
      setSelectedProblem,
      setIsSolutionModalOpen,
    });

    fireEvent.click(screen.getByText("Two Sum"));
    // Clicking the title link stops propagation, so the row handler must not fire from it.
    expect(setSelectedProblem).not.toHaveBeenCalled();

    const row = document.querySelector('[data-cy="dsa-row"]') as HTMLElement;
    fireEvent.click(row);
    expect(setSelectedProblem).toHaveBeenCalledWith(problem);
    expect(setIsSolutionModalOpen).toHaveBeenCalledWith(true);
  });

  test("clicking the edit icon opens the form modal without opening the solution modal", () => {
    const setProblemData = jest.fn();
    const setIsFormModalOpen = jest.fn();
    const setSelectedProblem = jest.fn();
    const setIsSolutionModalOpen = jest.fn();
    const problem = buildProblem();
    renderTable({
      fetchedProblems: [problem],
      setProblemData,
      setIsFormModalOpen,
      setSelectedProblem,
      setIsSolutionModalOpen,
    });

    const editButton = document.querySelector('[data-cy="dsa-row-edit"] svg') as SVGElement;
    fireEvent.click(editButton);

    expect(setProblemData).toHaveBeenCalledWith(problem);
    expect(setIsFormModalOpen).toHaveBeenCalledWith(true);
    expect(setSelectedProblem).not.toHaveBeenCalled();
    expect(setIsSolutionModalOpen).not.toHaveBeenCalled();
  });

  test("clicking the delete icon opens the confirmation modal for that problem", () => {
    const setSelectedProblem = jest.fn();
    const setIsOpenConfirmationModal = jest.fn();
    const problem = buildProblem();
    renderTable({
      fetchedProblems: [problem],
      setSelectedProblem,
      setIsOpenConfirmationModal,
    });

    const deleteButton = document.querySelector('[data-cy="dsa-row-delete"] svg') as SVGElement;
    fireEvent.click(deleteButton);

    expect(setSelectedProblem).toHaveBeenCalledWith(problem);
    expect(setIsOpenConfirmationModal).toHaveBeenCalledWith(true);
  });

  test("shows a Load More button when hasNextPage is true and calls fetchNextPage on click", () => {
    const fetchNextPage = jest.fn();
    renderTable({ hasNextPage: true, fetchNextPage });

    const loadMore = screen.getByRole("button", { name: "Load More" });
    fireEvent.click(loadMore);
    expect(fetchNextPage).toHaveBeenCalled();
  });

  test("shows 'Loading...' and disables the button while fetching the next page", () => {
    renderTable({ hasNextPage: true, isFetchingNextPage: true });

    const loadMore = screen.getByRole("button", { name: "Loading..." });
    expect(loadMore).toBeDisabled();
  });

  test("does not show a Load More button when hasNextPage is false", () => {
    renderTable({ hasNextPage: false });
    expect(screen.queryByRole("button", { name: /Load More|Loading/ })).not.toBeInTheDocument();
  });
});
