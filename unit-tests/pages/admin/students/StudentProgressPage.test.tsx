import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentProgressPage from "../../../../src/pages/admin/students/StudentProgressPage";
import { useAdminStudentsProgress } from "../../../../src/api/hooks/useAdminProgress";
import type { AdminStudentProgress } from "../../../../src/data/adminProgressData";

jest.mock("../../../../src/api/hooks/useAdminProgress", () => ({
  useAdminStudentsProgress: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockedUseAdminStudentsProgress = useAdminStudentsProgress as jest.Mock;

const student = (overrides: Partial<AdminStudentProgress> = {}): AdminStudentProgress => ({
  userId: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  catalog: { totalProblems: 10, solvedProblems: 5, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
  curriculum: { totalProblems: 8, solvedProblems: 2, solvedProblemIds: [], byTopic: [] },
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <StudentProgressPage />
    </MemoryRouter>
  );

describe("StudentProgressPage", () => {
  beforeEach(() => {
    mockedUseAdminStudentsProgress.mockReset();
    mockNavigate.mockReset();
  });

  test("renders loading skeleton rows while the hook is loading", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = renderPage();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("renders an error page when the hook errors", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();
    expect(screen.getByText("Failed to load student progress")).toBeInTheDocument();
  });

  test("renders the empty-state copy when there are no students", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText("No students yet.")).toBeInTheDocument();
  });

  test("renders each student's name, email, and computed curriculum/catalog percentages", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student()],
      isLoading: false,
      isError: false,
    });
    renderPage();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("2/8 (25%)")).toBeInTheDocument();
    expect(screen.getByText("5/10 (50%)")).toBeInTheDocument();
  });

  test("shows 0% rather than dividing by zero when a student has no problems at all", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [
        student({
          catalog: { totalProblems: 0, solvedProblems: 0, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
          curriculum: { totalProblems: 0, solvedProblems: 0, solvedProblemIds: [], byTopic: [] },
        }),
      ],
      isLoading: false,
      isError: false,
    });
    renderPage();
    // Both the curriculum and catalog cells are 0/0 here, so both render this same text.
    expect(screen.getAllByText("0/0 (0%)")).toHaveLength(2);
  });

  test("filters the roster client-side by name or email as the search box changes", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [
        student({ userId: "u1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }),
        student({ userId: "u2", firstName: "Grace", lastName: "Hopper", email: "grace@example.com" }),
      ],
      isLoading: false,
      isError: false,
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Search by name or email"), {
      target: { value: "grace" },
    });

    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  test("shows a no-match message when the search filters out every row", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student()],
      isLoading: false,
      isError: false,
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("Search by name or email"), {
      target: { value: "nobody" },
    });

    expect(screen.getByText("No students match your search.")).toBeInTheDocument();
  });

  test("clicking 'View detail' navigates to that student's detail route", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student({ userId: "u1" })],
      isLoading: false,
      isError: false,
    });
    renderPage();

    fireEvent.click(screen.getByText("View detail"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/students/progress/u1");
  });
});
