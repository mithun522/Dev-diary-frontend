import { render } from "@testing-library/react";
import MarkdownPreview from "../../src/components/MarkdownPreview";
import { useTheme } from "../../src/providers/ThemeProvider";

// react-markdown-preview is a heavy ESM leaf dependency - stub it with something that just
// exposes the props this wrapper is responsible for forwarding/injecting.
jest.mock("@uiw/react-markdown-preview", () => ({
  __esModule: true,
  default: ({ source, wrapperElement }: { source?: string; wrapperElement?: object }) => (
    <div data-cy="markdown-mock" data-color-mode={(wrapperElement as never)?.["data-color-mode"]}>
      {source}
    </div>
  ),
}));

jest.mock("../../src/providers/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.Mock;

describe("MarkdownPreview", () => {
  test("passes the app's resolved theme as data-color-mode, not the OS preference", () => {
    mockedUseTheme.mockReturnValue({ theme: "system", resolvedTheme: "light" });

    const { container } = render(<MarkdownPreview source="hello" />);

    expect(container.querySelector('[data-cy="markdown-mock"]')).toHaveAttribute(
      "data-color-mode",
      "light"
    );
  });

  test("reflects 'dark' when the app's resolved theme is dark", () => {
    mockedUseTheme.mockReturnValue({ theme: "dark", resolvedTheme: "dark" });

    const { container } = render(<MarkdownPreview source="hello" />);

    expect(container.querySelector('[data-cy="markdown-mock"]')).toHaveAttribute(
      "data-color-mode",
      "dark"
    );
  });

  test("forwards the source prop unchanged", () => {
    mockedUseTheme.mockReturnValue({ theme: "light", resolvedTheme: "light" });

    const { getByText } = render(<MarkdownPreview source="# Heading" />);

    expect(getByText("# Heading")).toBeInTheDocument();
  });

  test("a caller-supplied wrapperElement's data-color-mode is always overridden by the app theme", () => {
    mockedUseTheme.mockReturnValue({ theme: "light", resolvedTheme: "light" });

    const { container } = render(
      <MarkdownPreview
        source="hello"
        wrapperElement={{ "data-color-mode": "dark", id: "custom-id" } as never}
      />
    );

    expect(container.querySelector('[data-cy="markdown-mock"]')).toHaveAttribute(
      "data-color-mode",
      "light"
    );
  });
});
