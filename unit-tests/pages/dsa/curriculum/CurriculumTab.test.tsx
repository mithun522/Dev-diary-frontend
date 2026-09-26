import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CurriculumTab from "../../../../src/pages/dsa/curriculum/CurriculumTab";
import {
  useCurriculumProblems,
  useCurriculumProgress,
  useCurriculumTopics,
} from "../../../../src/api/hooks/useCurriculum";
import type {
  CurriculumProblem,
  CurriculumProgress,
  CurriculumTopic,
} from "../../../../src/data/curriculumData";

jest.mock("../../../../src/api/hooks/useCurriculum", () => ({
  useCurriculumTopics: jest.fn(),
  useCurriculumProblems: jest.fn(),
  useCurriculumProgress: jest.fn(),
}));

const mockedUseCurriculumTopics = useCurriculumTopics as jest.Mock;
const mockedUseCurriculumProblems = useCurriculumProblems as jest.Mock;
const mockedUseCurriculumProgress = useCurriculumProgress as jest.Mock;

const buildTopic = (overrides: Partial<CurriculumTopic> = {}): CurriculumTopic => ({
  id: "topic-1",
  slug: "basics",
  title: "Basics",
  description: "Language fundamentals",
  position: 1,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const buildProblem = (overrides: Partial<CurriculumProblem> = {}): CurriculumProblem => ({
  id: "prob-1",
  topicId: "topic-1",
  slug: "print-hello",
  title: "Print Hello",
  description: "Print hello world",
  language: "javascript",
  level: "beginner",
  starterCode: "console.log('hello')",
  position: 1,
  solved: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const buildProgress = (overrides: Partial<CurriculumProgress> = {}): CurriculumProgress => ({
  totalProblems: 5,
  solvedProblems: 2,
  solvedProblemIds: [],
  byTopic: [{ topicId: "topic-1", topicSlug: "basics", topicTitle: "Basics", total: 5, solved: 2 }],
  ...overrides,
});

const renderCurriculumTab = () =>
  render(
    <MemoryRouter>
      <CurriculumTab />
    </MemoryRouter>
  );

describe("CurriculumTab", () => {
  beforeEach(() => {
    mockedUseCurriculumTopics.mockReset();
    mockedUseCurriculumProblems.mockReset();
    mockedUseCurriculumProgress.mockReset();

    mockedUseCurriculumTopics.mockReturnValue({
      data: [buildTopic()],
      isLoading: false,
      error: null,
    });
    mockedUseCurriculumProblems.mockReturnValue({ data: undefined, isLoading: false });
    mockedUseCurriculumProgress.mockReturnValue({ data: buildProgress() });
  });

  test("renders a loading skeleton while topics are loading", () => {
    mockedUseCurriculumTopics.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { container } = renderCurriculumTab();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("renders the empty-state copy when there are no topics", () => {
    mockedUseCurriculumTopics.mockReturnValue({ data: [], isLoading: false, error: null });
    renderCurriculumTab();
    expect(screen.getByText("No curriculum topics yet.")).toBeInTheDocument();
  });

  test("renders an error page when the topics query fails", () => {
    mockedUseCurriculumTopics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("boom"),
    });
    renderCurriculumTab();
    expect(screen.getByText("Failed to fetch curriculum topics")).toBeInTheDocument();
  });

  test("renders each topic with its title, description and 'solved/total' progress", () => {
    renderCurriculumTab();
    expect(screen.getByText("Basics")).toBeInTheDocument();
    expect(screen.getByText("Language fundamentals")).toBeInTheDocument();
    expect(screen.getByText("2/5 solved")).toBeInTheDocument();
  });

  test("does not render a progress badge for a topic with zero total problems", () => {
    mockedUseCurriculumProgress.mockReturnValue({
      data: buildProgress({
        byTopic: [{ topicId: "topic-1", topicSlug: "basics", topicTitle: "Basics", total: 0, solved: 0 }],
      }),
    });
    renderCurriculumTab();
    expect(screen.queryByText(/solved$/)).not.toBeInTheDocument();
  });

  test("expanding a topic fetches and shows its problems, with a solved icon and level badge", () => {
    mockedUseCurriculumProblems.mockImplementation((topicId: string) =>
      topicId
        ? {
            data: [
              buildProblem({ id: "prob-1", title: "Print Hello", level: "beginner", solved: true }),
              buildProblem({ id: "prob-2", title: "Add Numbers", level: "medium", solved: false }),
            ],
            isLoading: false,
          }
        : { data: undefined, isLoading: false }
    );

    renderCurriculumTab();
    fireEvent.click(screen.getByRole("button", { name: /Basics/ }));

    expect(mockedUseCurriculumProblems).toHaveBeenLastCalledWith("topic-1", "javascript");
    expect(screen.getByText("Print Hello")).toBeInTheDocument();
    expect(screen.getByText("Add Numbers")).toBeInTheDocument();
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(
      document.querySelector('[data-cy="curriculum-problem-solved-icon"]')
    ).toBeInTheDocument();
  });

  test("shows a loading skeleton for the expanded topic's problems", () => {
    mockedUseCurriculumProblems.mockImplementation((topicId: string) =>
      topicId ? { data: undefined, isLoading: true } : { data: undefined, isLoading: false }
    );
    const { container } = renderCurriculumTab();
    fireEvent.click(screen.getByRole("button", { name: /Basics/ }));
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  test("shows the 'no problems' copy for an expanded topic with none in this language", () => {
    mockedUseCurriculumProblems.mockImplementation((topicId: string) =>
      topicId ? { data: [], isLoading: false } : { data: undefined, isLoading: false }
    );
    renderCurriculumTab();
    fireEvent.click(screen.getByRole("button", { name: /Basics/ }));
    expect(
      screen.getByText("No problems yet for this language in this topic.")
    ).toBeInTheDocument();
  });

  test("collapses an expanded topic on a second click", () => {
    mockedUseCurriculumProblems.mockImplementation((topicId: string) =>
      topicId ? { data: [buildProblem()], isLoading: false } : { data: undefined, isLoading: false }
    );
    renderCurriculumTab();
    const toggle = screen.getByRole("button", { name: /Basics/ });

    fireEvent.click(toggle);
    expect(screen.getByText("Print Hello")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByText("Print Hello")).not.toBeInTheDocument();
  });

  test("the language selector defaults to JavaScript and switching it re-queries progress for the new language", () => {
    renderCurriculumTab();
    const select = screen.getByDisplayValue("JavaScript") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "python" } });

    expect(screen.getByDisplayValue("Python")).toBeInTheDocument();
    expect(mockedUseCurriculumProgress).toHaveBeenLastCalledWith("python");
  });

  describe("overall progress summary", () => {
    test("shows a headline solved/total and percentage across all topics", () => {
      mockedUseCurriculumProgress.mockReturnValue({
        data: buildProgress({ totalProblems: 20, solvedProblems: 5 }),
        isLoading: false,
        isError: false,
      });
      renderCurriculumTab();
      expect(
        document.querySelector('[data-cy="curriculum-overall-progress"]')
      ).toHaveTextContent("5/20 solved (25%)");
    });

    test("shows 0% rather than dividing by zero when there are no curriculum problems at all", () => {
      mockedUseCurriculumProgress.mockReturnValue({
        data: buildProgress({ totalProblems: 0, solvedProblems: 0, byTopic: [] }),
        isLoading: false,
        isError: false,
      });
      renderCurriculumTab();
      expect(
        document.querySelector('[data-cy="curriculum-overall-progress"]')
      ).toHaveTextContent("0/0 solved (0%)");
    });

    test("renders neither the summary nor the error banner while progress is still loading", () => {
      mockedUseCurriculumProgress.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });
      renderCurriculumTab();
      expect(
        document.querySelector('[data-cy="curriculum-overall-progress"]')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('[data-cy="curriculum-progress-error"]')
      ).not.toBeInTheDocument();
    });

    test("shows a non-blocking error banner instead of the summary when progress fails to load, without hiding the topic list", () => {
      mockedUseCurriculumProgress.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });
      renderCurriculumTab();
      expect(
        document.querySelector('[data-cy="curriculum-progress-error"]')
      ).toHaveTextContent("Couldn't load your progress");
      expect(
        document.querySelector('[data-cy="curriculum-overall-progress"]')
      ).not.toBeInTheDocument();
      // Topics themselves still render — a progress failure is not fatal to the whole tab.
      expect(screen.getByText("Basics")).toBeInTheDocument();
    });
  });
});
