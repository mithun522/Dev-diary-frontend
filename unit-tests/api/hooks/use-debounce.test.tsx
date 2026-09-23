import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "../../../src/api/hooks/use-debounce";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useDebounce", () => {
  test("returns the initial value immediately, without waiting for the delay", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  test("does not surface a new value before the delay has elapsed", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(499);
    });

    expect(result.current).toBe("a");
  });

  test("surfaces the new value once the delay elapses", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("b");
  });

  test("a rapid sequence of changes settles only once, on the final value", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "" },
    });

    // Simulates typing "sum" quickly — each keystroke restarts the timer.
    for (const value of ["s", "su", "sum"]) {
      rerender({ value });
      act(() => {
        jest.advanceTimersByTime(100);
      });
    }

    // 300ms of typing has passed but no 500ms gap, so nothing has settled yet.
    expect(result.current).toBe("");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("sum");
  });

  test("defaults the delay to 500ms when none is given", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  test("honours a custom delay (the 1000ms debounce the search inputs use)", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("b");
  });

  test("clears the pending timeout on unmount so no state update fires afterwards", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { unmount } = renderHook(() => useDebounce("a", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  test("restarts the timer when the delay itself changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 500 } }
    );

    rerender({ value: "b", delay: 1000 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe("b");
  });

  test("works for non-string values (it is generic)", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: { page: 1 } },
    });

    const nextValue = { page: 2 };
    rerender({ value: nextValue });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe(nextValue);
  });

  test("settling on a value equal to the previous one is a no-op for consumers", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: "same" },
    });

    rerender({ value: "same" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe("same");
  });
});
