import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "../../../src/api/hooks/use-mobile";

// jsdom implements neither matchMedia nor a settable innerWidth, so both are stubbed here. The
// stub records the registered "change" listener so tests can drive a viewport change the way a
// real browser would.
type ChangeListener = () => void;

let registeredListeners: ChangeListener[];
let removedListeners: ChangeListener[];
let lastQuery: string | undefined;

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
};

beforeEach(() => {
  registeredListeners = [];
  removedListeners = [];
  lastQuery = undefined;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => {
      lastQuery = query;
      return {
        matches: window.innerWidth < 768,
        media: query,
        addEventListener: (_event: string, listener: ChangeListener) => {
          registeredListeners.push(listener);
        },
        removeEventListener: (_event: string, listener: ChangeListener) => {
          removedListeners.push(listener);
        },
      };
    },
  });
});

describe("useIsMobile", () => {
  test("is true below the 768px breakpoint", () => {
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test("is false at or above the 768px breakpoint", () => {
    setViewportWidth(1440);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test("767px (one below the breakpoint) is mobile", () => {
    setViewportWidth(767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  test("768px (exactly the breakpoint) is NOT mobile", () => {
    setViewportWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  test("subscribes with a max-width query one pixel below the breakpoint", () => {
    setViewportWidth(1024);
    renderHook(() => useIsMobile());
    expect(lastQuery).toBe("(max-width: 767px)");
  });

  test("registers exactly one change listener", () => {
    setViewportWidth(1024);
    renderHook(() => useIsMobile());
    expect(registeredListeners).toHaveLength(1);
  });

  test("re-evaluates when the media query reports a change (desktop -> mobile)", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      setViewportWidth(375);
      registeredListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  test("re-evaluates when the media query reports a change (mobile -> desktop)", () => {
    setViewportWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      setViewportWidth(1440);
      registeredListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(false);
  });

  test("removes the listener it registered on unmount (no leak)", () => {
    setViewportWidth(1024);
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removedListeners).toHaveLength(1);
    expect(removedListeners[0]).toBe(registeredListeners[0]);
  });

  test("always returns a boolean, never the undefined initial state", () => {
    setViewportWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });
});
