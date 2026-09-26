import MDPreview, { type MarkdownPreviewProps } from "@uiw/react-markdown-preview";
import { useTheme } from "../providers/ThemeProvider";

// @uiw/react-markdown-preview's bundled (github-markdown-css-based) styles only follow an
// explicit `data-color-mode` on its wrapper; left unset, they fall back to the OS's own
// prefers-color-scheme media query. That can disagree with the app's own light/dark toggle (e.g.
// app set to light while the OS is in dark mode), rendering the description in the wrong theme.
// This thin wrapper threads the app's own resolved theme through everywhere the preview is used,
// instead of every call site having to remember to pass it.
const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ wrapperElement, ...props }) => {
  const { resolvedTheme } = useTheme();

  return (
    <MDPreview
      {...props}
      wrapperElement={{ ...wrapperElement, "data-color-mode": resolvedTheme }}
    />
  );
};

export default MarkdownPreview;
