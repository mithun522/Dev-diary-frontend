import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CohortsPage from "../../../../src/pages/admin/students/CohortsPage";
import { useCohorts, useDeleteCohort } from "../../../../src/api/hooks/useCohorts";
import type { Cohort } from "../../../../src/data/cohortData";

jest.mock("../../../../src/api/hooks/useCohorts", () => ({
  useCohorts: jest.fn(),
  useDeleteCohort: jest.fn(),
  useCreateCohort: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useRenameCohort: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockedUseCohorts = useCohorts as jest.Mock;
const mockedUseDeleteCohort = useDeleteCohort as jest.Mock;

const cohort = (overrides: Partial<Cohort> = {}): Cohort => ({
  id: "c1",
  name: "Batch A",
  studentCount: 3,
  createdAt: "2026-01-15T00:00:00.000Z",
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <CohortsPage />
    </MemoryRouter>
  );

describe("CohortsPage", () => {
  const deleteMutateAsync = jest.fn();

  beforeEach(() => {
    mockedUseCohorts.mockReset();
    mockNavigate.mockReset();
    deleteMutateAsync.mockReset();
    mockedUseDeleteCohort.mockReturnValue({ mutateAsync: deleteMutateAsync, isPending: false });
  });

  test("renders loading skeleton rows while the hook is loading", () => {
    mockedUseCohorts.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    const { container } = renderPage();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("renders an error page when the hook errors", () => {
    mockedUseCohorts.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderPage();
    expect(screen.getByText("Failed to load cohorts")).toBeInTheDocument();
  });

  test("renders the empty-state copy when there are no cohorts", () => {
    mockedUseCohorts.mockReturnValue({ data: [], isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText("No cohorts yet.")).toBeInTheDocument();
  });

  test("renders each cohort's name, student count, and created date", () => {
    mockedUseCohorts.mockReturnValue({ data: [cohort()], isLoading: false, isError: false });
    renderPage();
    expect(screen.getByText("Batch A")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
  });

  test("clicking a cohort's name navigates to its detail route", () => {
    mockedUseCohorts.mockReturnValue({ data: [cohort()], isLoading: false, isError: false });
    renderPage();

    fireEvent.click(screen.getByText("Batch A"));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/students/cohorts/c1");
  });

  test("clicking delete then confirming calls the delete mutation", async () => {
    deleteMutateAsync.mockResolvedValue({ message: "Cohort deleted" });
    mockedUseCohorts.mockReturnValue({ data: [cohort()], isLoading: false, isError: false });
    renderPage();

    fireEvent.click(document.querySelector('[data-cy="admin-cohort-delete"]')!);
    fireEvent.click(screen.getByText("Delete"));

    await screen.findByText("Batch A"); // still on page (modal closes after resolve)
    expect(deleteMutateAsync).toHaveBeenCalledWith("c1");
  });
});
