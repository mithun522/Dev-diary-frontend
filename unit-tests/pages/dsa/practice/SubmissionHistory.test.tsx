import { fireEvent, render, screen } from "@testing-library/react";
import SubmissionHistory from "../../../../src/pages/dsa/practice/SubmissionHistory";
import { useFetchSubmissions } from "../../../../src/api/hooks/useFetchCatalog";
import { formatDate } from "../../../../src/utils/formatDate";
import type { Submission } from "../../../../src/data/catalogData";

jest.mock("../../../../src/api/hooks/useFetchCatalog", () => ({
  useFetchSubmissions: jest.fn(),
}));

const mockedUseFetchSubmissions = useFetchSubmissions as jest.Mock;

const buildSubmission = (overrides: Partial<Submission> = {}): Submission => ({
  id: "sub-1",
  problemId: "prob-1",
  sourceCode: "function twoSum() { return []; }",
  language: "javascript",
  status: "ACCEPTED",
  results: [],
  runtimeMs: 12,
  createdAt: "2024-01-15T12:00:00.000Z",
  ...overrides,
});

describe("SubmissionHistory", () => {
  beforeEach(() => {
    mockedUseFetchSubmissions.mockReset();
  });

  test("renders loading skeletons while the hook is loading", () => {
    mockedUseFetchSubmissions.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<SubmissionHistory problemId="prob-1" onSelect={jest.fn()} />);

    // 3 skeleton rows x 4 placeholders each.
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(12);
    expect(screen.queryByText(/No submissions yet/)).not.toBeInTheDocument();
  });

  test("renders the empty-state copy when there are no submissions", () => {
    mockedUseFetchSubmissions.mockReturnValue({ data: [], isLoading: false });
    render(<SubmissionHistory problemId="prob-1" onSelect={jest.fn()} />);

    expect(screen.getByText("No submissions yet for this problem.")).toBeInTheDocument();
  });

  test("renders the empty-state copy when data is undefined (not loading)", () => {
    mockedUseFetchSubmissions.mockReturnValue({ data: undefined, isLoading: false });
    render(<SubmissionHistory problemId="prob-1" onSelect={jest.fn()} />);

    expect(screen.getByText("No submissions yet for this problem.")).toBeInTheDocument();
  });

  test("renders one row per submission with verdict badge, language label, runtime and date", () => {
    const submissions = [
      buildSubmission({
        id: "sub-1",
        status: "ACCEPTED",
        language: "python",
        runtimeMs: 15,
        createdAt: "2024-01-15T12:00:00.000Z",
      }),
      buildSubmission({
        id: "sub-2",
        status: "WRONG_ANSWER",
        language: "java",
        runtimeMs: 32,
        createdAt: "2024-02-20T12:00:00.000Z",
      }),
    ];
    mockedUseFetchSubmissions.mockReturnValue({ data: submissions, isLoading: false });
    const { container } = render(<SubmissionHistory problemId="prob-1" onSelect={jest.fn()} />);

    const rows = container.querySelectorAll('[data-cy="practice-submission-row"]');
    expect(rows).toHaveLength(2);

    expect(screen.getByText("Accepted")).toBeInTheDocument();
    expect(screen.getByText("Wrong Answer")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Java")).toBeInTheDocument();
    expect(screen.getByText("15ms")).toBeInTheDocument();
    expect(screen.getByText("32ms")).toBeInTheDocument();
    expect(screen.getByText(formatDate(submissions[0].createdAt))).toBeInTheDocument();
    expect(screen.getByText(formatDate(submissions[1].createdAt))).toBeInTheDocument();
  });

  test("clicking a row invokes onSelect with that submission's own source code and language", () => {
    const submissions = [
      buildSubmission({ id: "sub-1", sourceCode: "print('a')", language: "python" }),
      buildSubmission({ id: "sub-2", sourceCode: "System.out.println('b');", language: "java" }),
    ];
    mockedUseFetchSubmissions.mockReturnValue({ data: submissions, isLoading: false });
    const onSelect = jest.fn();
    render(<SubmissionHistory problemId="prob-1" onSelect={onSelect} />);

    const rows = screen.getAllByRole("button");
    fireEvent.click(rows[0]);
    expect(onSelect).toHaveBeenLastCalledWith("print('a')", "python");

    fireEvent.click(rows[1]);
    expect(onSelect).toHaveBeenLastCalledWith("System.out.println('b');", "java");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  test("pressing Enter on a row invokes onSelect with its source code and language", () => {
    const submissions = [
      buildSubmission({ id: "sub-1", sourceCode: "const x = 1;", language: "typescript" }),
    ];
    mockedUseFetchSubmissions.mockReturnValue({ data: submissions, isLoading: false });
    const onSelect = jest.fn();
    render(<SubmissionHistory problemId="prob-1" onSelect={onSelect} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("const x = 1;", "typescript");
  });

  test("pressing Space on a row invokes onSelect with its source code and language", () => {
    const submissions = [
      buildSubmission({ id: "sub-1", sourceCode: "puts 'hi'", language: "c" }),
    ];
    mockedUseFetchSubmissions.mockReturnValue({ data: submissions, isLoading: false });
    const onSelect = jest.fn();
    render(<SubmissionHistory problemId="prob-1" onSelect={onSelect} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onSelect).toHaveBeenCalledWith("puts 'hi'", "c");
  });

  test("a key other than Enter/Space does not invoke onSelect", () => {
    const submissions = [buildSubmission({ id: "sub-1" })];
    mockedUseFetchSubmissions.mockReturnValue({ data: submissions, isLoading: false });
    const onSelect = jest.fn();
    render(<SubmissionHistory problemId="prob-1" onSelect={onSelect} />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" });
    expect(onSelect).not.toHaveBeenCalled();
  });
});
