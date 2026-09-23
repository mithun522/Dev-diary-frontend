// ThemeToggle only consumes useTheme's return value; the provider's own resolution logic is
// covered separately in unit-tests/providers/ThemeProvider.test.tsx, so it's mocked directly here.
jest.mock("../../src/providers/ThemeProvider", () => ({ useTheme: jest.fn() }));

import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../../src/components/ThemeToggle";
import { useTheme } from "../../src/providers/ThemeProvider";

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

// Radix's DropdownMenuTrigger opens on pointerdown/keydown, not a plain click event, under jsdom.
const openMenu = () => {
  fireEvent.keyDown(screen.getByRole("button", { name: "Toggle theme" }), {
    key: "Enter",
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ThemeToggle — reflects the current theme", () => {
  test("shows the Sun icon when theme is 'light'", () => {
    mockedUseTheme.mockReturnValue({ theme: "light", setTheme: jest.fn() });

    const { container } = render(<ThemeToggle />);

    expect(container.querySelector(".lucide-sun")).toBeInTheDocument();
    expect(container.querySelector(".lucide-moon")).not.toBeInTheDocument();
  });

  test("shows the Moon icon when theme is 'dark'", () => {
    mockedUseTheme.mockReturnValue({ theme: "dark", setTheme: jest.fn() });

    const { container } = render(<ThemeToggle />);

    expect(container.querySelector(".lucide-moon")).toBeInTheDocument();
    expect(container.querySelector(".lucide-sun")).not.toBeInTheDocument();
  });
});

describe("ThemeToggle — changes the theme", () => {
  test("opens a menu with Light, Dark and System options", () => {
    mockedUseTheme.mockReturnValue({ theme: "light", setTheme: jest.fn() });

    render(<ThemeToggle />);
    openMenu();

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  test("selecting 'Dark' calls setTheme('dark')", () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: "light", setTheme });

    render(<ThemeToggle />);
    openMenu();
    fireEvent.click(screen.getByText("Dark"));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  test("selecting 'Light' calls setTheme('light')", () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: "dark", setTheme });

    render(<ThemeToggle />);
    openMenu();
    fireEvent.click(screen.getByText("Light"));

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  test("selecting 'System' calls setTheme('system')", () => {
    const setTheme = jest.fn();
    mockedUseTheme.mockReturnValue({ theme: "dark", setTheme });

    render(<ThemeToggle />);
    openMenu();
    fireEvent.click(screen.getByText("System"));

    expect(setTheme).toHaveBeenCalledWith("system");
  });
});
