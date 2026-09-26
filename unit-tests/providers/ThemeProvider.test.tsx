import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/providers/ThemeProvider";

// jsdom implements neither matchMedia, so it's stubbed here. `matchMediaMatches` lets each test
// pick whether the simulated OS prefers dark mode.
let matchMediaMatches = false;

const TestConsumer = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>set-dark</button>
      <button onClick={() => setTheme("light")}>set-light</button>
      <button onClick={() => setTheme("system")}>set-system</button>
    </div>
  );
};

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  matchMediaMatches = false;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: matchMediaMatches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
});

describe("ThemeProvider — initial resolution", () => {
  test("defaults to 'system' and applies 'dark' to <html> when the OS prefers dark", () => {
    matchMediaMatches = true;

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  test("defaults to 'system' and applies 'light' to <html> when the OS prefers light", () => {
    matchMediaMatches = false;

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("uses the defaultTheme prop when localStorage has no stored value", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  test("reads a persisted theme from localStorage['theme'], overriding defaultTheme", () => {
    window.localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("ThemeProvider — setTheme", () => {
  test("persists the new theme to localStorage['theme']", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("set-dark"));

    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  test("swaps the <html> class from the old theme to the new one", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("light")).toBe(true);

    fireEvent.click(screen.getByText("set-dark"));

    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("switching to 'system' re-resolves against the current OS preference", () => {
    matchMediaMatches = true;

    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("set-system"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("ThemeProvider — resolvedTheme", () => {
  test("resolves to 'dark' when explicitly set to 'dark', regardless of OS preference", () => {
    matchMediaMatches = false;

    render(
      <ThemeProvider defaultTheme="dark">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
  });

  test("resolves to 'light' when explicitly set to 'light', even while the OS prefers dark", () => {
    matchMediaMatches = true;

    render(
      <ThemeProvider defaultTheme="light">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("resolves 'system' against the OS preference", () => {
    matchMediaMatches = true;

    render(
      <ThemeProvider defaultTheme="system">
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
  });
});

describe("useTheme — usage outside a ThemeProvider", () => {
  test("BUG: silently falls back to the no-op default instead of throwing", () => {
    // useTheme() guards with `if (context === undefined) throw ...`, but the context was created
    // via createContext(initialState) — a concrete object, never undefined — so that guard is
    // dead code. Outside a provider this renders fine with theme "system" and a setTheme that
    // quietly does nothing, instead of failing loudly as the source comment/guard intends.
    render(<TestConsumer />);

    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");

    expect(() => fireEvent.click(screen.getByText("set-dark"))).not.toThrow();
    expect(window.localStorage.getItem("theme")).toBeNull();
    expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
  });
});
