import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CohortDetailPage from "../../../../src/pages/admin/students/CohortDetailPage";
import {
  useCohorts,
  useCohortStudents,
  useRemoveStudentFromCohort,
} from "../../../../src/api/hooks/useCohorts";
import { useAdminStudentsProgress } from "../../../../src/api/hooks/useAdminProgress";
import type { CohortStudent } from "../../../../src/data/cohortData";

jest.mock("../../../../src/api/hooks/useCohorts", () => ({
  useCohorts: jest.fn(),
  useCohortStudents: jest.fn(),
  useRemoveStudentFromCohort: jest.fn(),
  useAddStudentsToCohort: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

jest.mock("../../../../src/api/hooks/useAdminProgress", () => ({
  useAdminStudentsProgress: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockedUseCohorts = useCohorts as jest.Mock;
const mockedUseCohortStudents = useCohortStudents as jest.Mock;
const mockedUseRemoveStudentFromCohort = useRemoveStudentFromCohort as jest.Mock;
const mockedUseAdminStudentsProgress = useAdminStudentsProgress as jest.Mock;

const student = (overrides: Partial<CohortStudent> = {}): CohortStudent => ({
  id: "u1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  status: "active",
  ...overrides,
});

const renderDetail = (id = "c1") =>
  render(
    <MemoryRouter initialEntries={[`/admin/students/cohorts/${id}`]}>
      <Routes>
        <Route path="/admin/students/cohorts/:id" element={<CohortDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("CohortDetailPage", () => {
  const removeMutateAsync = jest.fn();

  beforeEach(() => {
    mockedUseCohorts.mockReturnValue({
      data: [{ id: "c1", name: "Batch A", studentCount: 1, createdAt: "x" }],
    });
    mockedUseAdminStudentsProgress.mockReturnValue({ data: [], isLoading: false, isError: false });
    removeMutateAsync.mockReset();
    mockedUseRemoveStudentFromCohort.mockReturnValue({
      mutateAsync: removeMutateAsync,
      isPending: false,
    });
    mockNavigate.mockReset();
  });

  test("renders an error page when the students query errors", () => {
    mockedUseCohortStudents.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderDetail();
    expect(screen.getByText("Failed to load this cohort's students")).toBeInTheDocument();
  });

  test("renders the cohort's name from the cohorts list and its students", () => {
    mockedUseCohortStudents.mockReturnValue({
      data: [student()],
      isLoading: false,
      isError: false,
    });
    renderDetail();
    expect(screen.getByText("Batch A")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  test("renders 'Pending' for a student who hasn't accepted their invite yet", () => {
    mockedUseCohortStudents.mockReturnValue({
      data: [student({ status: "pending" })],
      isLoading: false,
      isError: false,
    });
    renderDetail();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  test("renders the empty-state copy when the cohort has no students", () => {
    mockedUseCohortStudents.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderDetail();
    expect(screen.getByText("No students in this cohort yet.")).toBeInTheDocument();
  });

  test("the back button navigates to the cohorts list", () => {
    mockedUseCohortStudents.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderDetail();

    fireEvent.click(screen.getByText("Back to Cohorts"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/students/cohorts");
  });

  test("removing a student calls the remove mutation with the student's id, after confirming", async () => {
    removeMutateAsync.mockResolvedValue({ message: "Student removed from cohort" });
    mockedUseCohortStudents.mockReturnValue({
      data: [student()],
      isLoading: false,
      isError: false,
    });
    renderDetail();

    fireEvent.click(document.querySelector('[data-cy="admin-cohort-remove-student"]')!);
    fireEvent.click(screen.getByText("Delete"));

    await screen.findByText("Ada Lovelace");
    expect(removeMutateAsync).toHaveBeenCalledWith("u1");
  });
});
