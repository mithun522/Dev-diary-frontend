import { render, screen } from "@testing-library/react";
import TestResultsPanel from "../../../../src/pages/dsa/practice/TestResultsPanel";
import type {
  JudgeCaseResult,
  JudgeResult,
  JudgeStatus,
} from "../../../../src/data/catalogData";

const passingCase = (overrides: Partial<JudgeCaseResult> = {}): JudgeCaseResult => ({
  args: [1, 2],
  expected: 3,
  actual: 3,
  passed: true,
  ...overrides,
});

const failingCase = (overrides: Partial<JudgeCaseResult> = {}): JudgeCaseResult => ({
  args: [1, 2],
  expected: 3,
  actual: 4,
  passed: false,
  ...overrides,
});

const buildResult = (overrides: Partial<JudgeResult> = {}): JudgeResult => ({
  status: "ACCEPTED",
  results: [passingCase()],
  runtimeMs: 42,
  ...overrides,
});

describe("TestResultsPanel", () => {
  test("renders the N/M passed header alongside the runtime", () => {
    const result = buildResult({
      results: [passingCase(), passingCase(), failingCase()],
      runtimeMs: 123,
    });
    const { container } = render(<TestResultsPanel result={result} paramNames={["a", "b"]} />);

    expect(container.textContent).toContain("2/3 test cases passed");
    expect(container.textContent).toContain("123ms");
  });

  test("renders 0/0 (not a crash) when results is empty", () => {
    const result = buildResult({ results: [] });
    const { container } = render(<TestResultsPanel result={result} />);

    expect(container.textContent).toContain("0/0 test cases passed");
    expect(container.querySelectorAll('[data-cy="practice-results-case"]')).toHaveLength(0);
  });

  test.each<[JudgeStatus, string]>([
    ["ACCEPTED", "Accepted"],
    ["WRONG_ANSWER", "Wrong Answer"],
    ["RUNTIME_ERROR", "Runtime Error"],
    ["TIMED_OUT", "Timed Out"],
    ["COMPILE_ERROR", "Compile Error"],
  ])("renders the %s verdict badge as '%s'", (status, label) => {
    render(<TestResultsPanel result={buildResult({ status })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test("shows the Expected row but not an Actual row for a passing case", () => {
    const result = buildResult({ results: [passingCase({ expected: 10, actual: 10 })] });
    const { container } = render(<TestResultsPanel result={result} />);

    expect(container.textContent).toContain("Expected: 10");
    expect(container.textContent).not.toContain("Actual:");
  });

  test("shows both Expected and Actual rows for a failing case", () => {
    const result = buildResult({ results: [failingCase({ expected: 10, actual: 99 })] });
    const { container } = render(<TestResultsPanel result={result} />);

    expect(container.textContent).toContain("Expected: 10");
    expect(container.textContent).toContain("Actual: 99");
  });

  test("renders the case's error text when present", () => {
    const result = buildResult({
      results: [failingCase({ error: "Segmentation fault" })],
    });
    const { container } = render(<TestResultsPanel result={result} />);

    expect(container.textContent).toContain("Error: Segmentation fault");
  });

  test("labels each test case with its 1-based position and pass/fail text", () => {
    const result = buildResult({ results: [passingCase(), failingCase()] });
    const { container } = render(<TestResultsPanel result={result} />);

    expect(container.textContent).toContain("Test case 1");
    expect(container.textContent).toContain("Passed");
    expect(container.textContent).toContain("Test case 2");
    expect(container.textContent).toContain("Failed");
  });

  test("renders every case in a large (165) migrated test-case set without assuming a small count", () => {
    const results: JudgeCaseResult[] = Array.from({ length: 165 }, (_, i) =>
      i % 3 === 0 ? failingCase({ args: [i] }) : passingCase({ args: [i] })
    );
    const expectedPassed = results.filter((r) => r.passed).length;

    const { container } = render(<TestResultsPanel result={buildResult({ results })} />);

    expect(container.textContent).toContain(`${expectedPassed}/165 test cases passed`);
    expect(container.querySelectorAll('[data-cy="practice-results-case"]')).toHaveLength(165);
  });
});
