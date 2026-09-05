import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { useTheme } from "../../../providers/ThemeProvider";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

// ThemeProvider only tracks the user's chosen mode ("dark" | "light" | "system"); "system" needs
// resolving against the OS preference the same way ThemeProvider itself does for the <html> class.
const resolveEditorTheme = (theme: string): "dark" | "light" => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme === "dark" ? "dark" : "light";
};

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly }) => {
  const { theme } = useTheme();

  return (
    <CodeMirror
      value={value}
      height="100%"
      width="100%"
      theme={resolveEditorTheme(theme)}
      // Without line wrapping, a single long line (common when a solution is written on one
      // line) forces CodeMirror's internal scroller to its full content width; since nothing
      // upstream in the split-pane layout applies `min-w-0`, that width bubbles all the way up
      // and overflows the whole page horizontally instead of staying contained in the editor.
      extensions={[javascript(), EditorView.lineWrapping]}
      onChange={onChange}
      readOnly={readOnly}
      basicSetup={{ tabSize: 2 }}
      data-cy="practice-code-editor"
      className="h-full w-full min-w-0 text-sm"
    />
  );
};

export default CodeEditor;
