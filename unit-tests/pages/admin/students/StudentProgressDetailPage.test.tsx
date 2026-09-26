import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StudentProgressDetailPage from "../../../../src/pages/admin/students/StudentProgressDetailPage";
import { useAdminStudentProgress } from "../../../../src/api/hooks/useAdminProgress";
import type { AdminStudentProgress } from "../../../../src/data/adminProgressData";

jest.mock("../../../../src/api/hooks/useAdminProgress", () => ({
  useAdminStudentProgress: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockedUseAdminStudentProgress = useAdminStudentProgress as jest.Mock;

const student = (overrides: Partial<AdminStudentProgress> = {}): AdminStudentProgress => ({
  userId: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  catalog: {
    totalProblems: 10,
    solvedProblems: 5,
    solvedProblemIds: [],
    byDifficulty: [
      { difficulty: "EASY", total: 5, solved: 3 },
      { difficulty: "MEDIUM", total: 3, solved: 2 },
      { difficulty: "HARD", total: 2, solved: 0 },
    ],
    byTopic: [],
  },
  curriculum: {
    totalProblems: 8,
    solvedProblems: 2,
    solvedProblemIds: [],
    byTopic: [
      { topicId: "t1", topicSlug: "basics", topicTitle: "Basics", total: 8, solved: 2 },
    ],
  },
  ...overrides,
});

const renderDetail = (userId = "u1") =>
  render(
    <MemoryRouter initialEntries={[`/admin/students/progress/${userId}`]}>
      <Routes>
        <Route
          path="/admin/students/progress/:userId"
          element={<StudentProgressDetailPage />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("StudentProgressDetailPage", () => {
  beforeEach(() => {
    mockedUseAdminStudentProgress.mockReset();
    mockNavigate.mockReset();
  });

  test("calls the hook with the userId from the route", () => {
    mockedUseAdminStudentProgress.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderDetail("u1");
    expect(mockedUseAdminStudentProgress).toHaveBeenCalledWith("u1");
  });

  test("renders an error page when the hook errors", () => {
    mockedUseAdminStudentProgress.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderDetail();
    expect(screen.getByText("Failed to load this student's progress")).toBeInTheDocument();
  });

  test("shows loading skeletons and no header while the hook is loading", () => {
    mockedUseAdminStudentProgress.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = renderDetail();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  });

  test("renders the student's name/email header and the three progress cards once loaded", () => {
    mockedUseAdminStudentProgress.mockReturnValue({
      data: student(),
      isLoading: false,
      isError: false,
    });
    renderDetail();

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(document.querySelector('[data-cy="dsa-curriculum-progress"]')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="dsa-practice-progress"]')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="dsa-practice-topic-coverage"]')).toBeInTheDocument();
  });

  test("the back button navigates to the previous entry in history", () => {
    mockedUseAdminStudentProgress.mockReturnValue({
      data: student(),
      isLoading: false,
      isError: false,
    });
    renderDetail();

    fireEvent.click(screen.getByText("Back"));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
