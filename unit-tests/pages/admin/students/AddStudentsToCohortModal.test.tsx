import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddStudentsToCohortModal from "../../../../src/pages/admin/students/AddStudentsToCohortModal";
import { useAdminStudentsProgress } from "../../../../src/api/hooks/useAdminProgress";
import { useAddStudentsToCohort } from "../../../../src/api/hooks/useCohorts";
import type { AdminStudentProgress } from "../../../../src/data/adminProgressData";

jest.mock("../../../../src/api/hooks/useAdminProgress", () => ({
  useAdminStudentsProgress: jest.fn(),
}));

jest.mock("../../../../src/api/hooks/useCohorts", () => ({
  useAddStudentsToCohort: jest.fn(),
}));

const mockedUseAdminStudentsProgress = useAdminStudentsProgress as jest.Mock;
const mockedUseAddStudentsToCohort = useAddStudentsToCohort as jest.Mock;

const student = (overrides: Partial<AdminStudentProgress> = {}): AdminStudentProgress => ({
  userId: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  catalog: { totalProblems: 0, solvedProblems: 0, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
  curriculum: { totalProblems: 0, solvedProblems: 0, solvedProblemIds: [], byTopic: [] },
  ...overrides,
});

describe("AddStudentsToCohortModal", () => {
  const mutateAsync = jest.fn();
  const setOpen = jest.fn();

  beforeEach(() => {
    mutateAsync.mockReset();
    setOpen.mockReset();
    mockedUseAddStudentsToCohort.mockReturnValue({ mutateAsync });
  });

  test("excludes students already in this cohort from the picker", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [
        student({ userId: "u1", firstName: "Ada", lastName: "Lovelace" }),
        student({ userId: "u2", firstName: "Grace", lastName: "Hopper" }),
      ],
      isLoading: false,
      isError: false,
    });
    render(
      <AddStudentsToCohortModal
        open
        setOpen={setOpen}
        cohortId="c1"
        excludeStudentIds={["u1"]}
      />
    );

    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  test("filters candidates by name or email as the search box changes", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [
        student({ userId: "u1", firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }),
        student({ userId: "u2", firstName: "Grace", lastName: "Hopper", email: "grace@example.com" }),
      ],
      isLoading: false,
      isError: false,
    });
    render(<AddStudentsToCohortModal open setOpen={setOpen} cohortId="c1" excludeStudentIds={[]} />);

    fireEvent.change(screen.getByPlaceholderText("Search by name or email"), {
      target: { value: "grace" },
    });

    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  test("the submit button is disabled until at least one student is selected", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student()],
      isLoading: false,
      isError: false,
    });
    render(<AddStudentsToCohortModal open setOpen={setOpen} cohortId="c1" excludeStudentIds={[]} />);

    expect(screen.getByText("Add (0)")).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByText("Add (1)")).not.toBeDisabled();
  });

  test("submitting calls the mutation with the selected userIds and closes on success", async () => {
    mutateAsync.mockResolvedValue({
      message: "Added 1 of 1",
      results: [{ studentId: "u1", status: "added" }],
    });
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student({ userId: "u1" })],
      isLoading: false,
      isError: false,
    });
    render(<AddStudentsToCohortModal open setOpen={setOpen} cohortId="c1" excludeStudentIds={[]} />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByText("Add (1)"));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(["u1"]));
  });

  test("shows the no-candidates copy when every roster student is already in this cohort", () => {
    mockedUseAdminStudentsProgress.mockReturnValue({
      data: [student({ userId: "u1" })],
      isLoading: false,
      isError: false,
    });
    render(
      <AddStudentsToCohortModal open setOpen={setOpen} cohortId="c1" excludeStudentIds={["u1"]} />
    );

    expect(screen.getByText("No students left to add.")).toBeInTheDocument();
  });
});
