import { render, screen } from "@testing-library/react";
import CurriculumResultsPanel from "../../../../src/pages/dsa/curriculum/CurriculumResultsPanel";
import type {
  CurriculumJudgeStatus,
  CurriculumResultCase,
  CurriculumRunResult,
} from "../../../../src/data/curriculumData";

const passingCase = (overrides: Partial<CurriculumResultCase> = {}): CurriculumResultCase => ({
  expectedStdout: "hello",
  actualStdout: "hello",
  passed: true,
  ...overrides,
});

const failingCase = (overrides: Partial<CurriculumResultCase> = {}): CurriculumResultCase => ({
  expectedStdout: "hello",
  actualStdout: "goodbye",
  passed: false,
  ...overrides,
});

const buildResult = (overrides: Partial<CurriculumRunResult> = {}): CurriculumRunResult => ({
  status: "ACCEPTED",
  results: [passingCase()],
  runtimeMs: 42,
  ...overrides,
});

describe("CurriculumResultsPanel", () => {
  test("renders the N/M passed header alongside the runtime", () => {
    const result = buildResult({
      results: [passingCase(), passingCase(), failingCase()],
      runtimeMs: 77,
    });
    const { container } = render(<CurriculumResultsPanel result={result} />);

    expect(container.textContent).toContain("2/3 test cases passed");
    expect(container.textContent).toContain("77ms");
  });

  test("renders 0/0 (not a crash) when results is empty", () => {
    const result = buildResult({ results: [] });
    const { container } = render(<CurriculumResultsPanel result={result} />);

    expect(container.textContent).toContain("0/0 test cases passed");
    expect(container.querySelectorAll('[data-cy="curriculum-results-case"]')).toHaveLength(0);
  });

  test.each<[CurriculumJudgeStatus, string]>([
    ["ACCEPTED", "Accepted"],
    ["WRONG_ANSWER", "Wrong Answer"],
    ["RUNTIME_ERROR", "Runtime Error"],
    ["TIMED_OUT", "Timed Out"],
    ["COMPILE_ERROR", "Compile Error"],
  ])("renders the %s verdict badge as '%s'", (status, label) => {
    render(<CurriculumResultsPanel result={buildResult({ status })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test("shows the Expected output row but not an Actual output row for a passing case", () => {
    const result = buildResult({
      results: [passingCase({ expectedStdout: "42\n", actualStdout: "42\n" })],
    });
    const { container } = render(<CurriculumResultsPanel result={result} />);

    expect(container.textContent).toContain("Expected output: 42");
    expect(container.textContent).not.toContain("Actual output:");
  });

  test("shows both Expected output and Actual output rows for a failing case", () => {
    const result = buildResult({
      results: [failingCase({ expectedStdout: "42\n", actualStdout: "43\n" })],
    });
    const { container } = render(<CurriculumResultsPanel result={result} />);

    expect(container.textContent).toContain("Expected output: 42");
    expect(container.textContent).toContain("Actual output: 43");
  });

  test("renders the case's error text when present", () => {
    const result = buildResult({
      results: [failingCase({ error: "Unhandled exception" })],
    });
    const { container } = render(<CurriculumResultsPanel result={result} />);

    expect(container.textContent).toContain("Error: Unhandled exception");
  });

  test("renders every case in a large (165) migrated test-case set without assuming a small count", () => {
    const results: CurriculumResultCase[] = Array.from({ length: 165 }, (_, i) =>
      i % 4 === 0 ? failingCase() : passingCase()
    );
    const expectedPassed = results.filter((r) => r.passed).length;

    const { container } = render(<CurriculumResultsPanel result={buildResult({ results })} />);

    expect(container.textContent).toContain(`${expectedPassed}/165 test cases passed`);
    expect(container.querySelectorAll('[data-cy="curriculum-results-case"]')).toHaveLength(165);
  });
});
