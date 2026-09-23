import { fireEvent, render, screen } from "@testing-library/react";
import SolutionModal from "../../../src/pages/dsa/SolutionModal";
import type { DSAProblem } from "../../../src/data/dsaProblemsData";

// react-markdown-preview is a heavy ESM leaf dependency (rendering it for real drags in a full
// markdown/syntax-highlighting pipeline) — stub it with something that just exposes its `source`
// prop so assertions can check what content SolutionModal handed it.
jest.mock("@uiw/react-markdown-preview", () => ({
  __esModule: true,
  default: ({ source }: { source?: string }) => <div data-cy="markdown-mock">{source}</div>,
}));

// Not resolvable/transformable by the jest config (no asset transform is configured), so it's
// stubbed as a virtual module rather than loaded from disk.
jest.mock(
  "../../../src/assets/no-notes-added.webp",
  () => "no-notes-added.webp",
  { virtual: true }
);

const buildProblem = (overrides: Partial<DSAProblem> = {}): DSAProblem => ({
  id: "p1",
  problem: "Two Sum",
  difficulty: "EASY",
  language: "JAVASCRIPT",
  topics: ["ARRAY", "HASHING"],
  link: "https://leetcode.com/problems/two-sum",
  status: "SOLVED",
  bruteForceSolution: "// brute force\nfunction twoSum() {}",
  betterSolution: "// better\nfunction twoSum() {}",
  optimisedSolution: "// optimised\nfunction twoSum() {}",
  ...overrides,
});

const renderModal = (overrides: Partial<React.ComponentProps<typeof SolutionModal>> = {}) => {
  const setSelectedProblem = jest.fn();
  const setOpen = jest.fn();
  const utils = render(
    <SolutionModal
      selectedProblem={buildProblem()}
      setSelectedProblem={setSelectedProblem}
      open={true}
      setOpen={setOpen}
      {...overrides}
    />
  );
  return { ...utils, setSelectedProblem, setOpen };
};

describe("SolutionModal", () => {
  test("renders nothing when closed", () => {
    const { container } = renderModal({ open: false });
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the problem title and difficulty badge", () => {
    renderModal({ selectedProblem: buildProblem({ problem: "Two Sum", difficulty: "HARD" }) });
    expect(screen.getByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText("HARD")).toBeInTheDocument();
  });

  test("renders a badge per topic", () => {
    renderModal({ selectedProblem: buildProblem({ topics: ["ARRAY", "GRAPH"] }) });
    expect(screen.getByText("ARRAY")).toBeInTheDocument();
    expect(screen.getByText("GRAPH")).toBeInTheDocument();
  });

  test("shows the first solution (Brute Force) by default with its code handed to the markdown preview", () => {
    renderModal();
    expect(screen.getByText("Solution 1: Brute Force")).toBeInTheDocument();
    expect(screen.getByText(/brute force/)).toBeInTheDocument();
  });

  test("moving next/previous cycles through the non-empty solutions only", () => {
    renderModal({
      selectedProblem: buildProblem({
        bruteForceSolution: "// brute",
        betterSolution: undefined,
        optimisedSolution: "// optimised",
      }),
    });

    expect(screen.getByText("Solution 1: Brute Force")).toBeInTheDocument();

    const [prevButton, nextButton] = screen.getAllByRole("button", { name: "" });
    fireEvent.click(nextButton);
    expect(screen.getByText("Solution 2: Optimised")).toBeInTheDocument();

    // Already on the last solution — clicking next again must not go out of bounds.
    fireEvent.click(nextButton);
    expect(screen.getByText("Solution 2: Optimised")).toBeInTheDocument();

    fireEvent.click(prevButton);
    expect(screen.getByText("Solution 1: Brute Force")).toBeInTheDocument();

    // Already on the first solution — clicking previous again must not go out of bounds.
    fireEvent.click(prevButton);
    expect(screen.getByText("Solution 1: Brute Force")).toBeInTheDocument();
  });

  test("renders notes when present", () => {
    renderModal({ selectedProblem: buildProblem({ notes: "Remember the hashmap trick" }) });
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Notes" }));
    expect(screen.getByText("Remember the hashmap trick")).toBeInTheDocument();
  });

  test("renders the no-notes placeholder copy when notes are absent", () => {
    renderModal({ selectedProblem: buildProblem({ notes: undefined }) });
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Notes" }));
    expect(screen.getByText("No notes added yet for this problem.")).toBeInTheDocument();
  });

  test("clicking the close button closes the modal and clears the selected problem", () => {
    const { setOpen, setSelectedProblem } = renderModal();
    fireEvent.click(screen.getByText("×"));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(setSelectedProblem).toHaveBeenCalledWith(null);
  });

  test("clicking the backdrop overlay closes the modal and clears the selected problem", () => {
    const { container, setOpen, setSelectedProblem } = renderModal();
    const overlay = container.querySelector(".fixed > .absolute.inset-0") as HTMLElement;
    fireEvent.click(overlay);
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(setSelectedProblem).toHaveBeenCalledWith(null);
  });
});
