import CodeMirror, { type Extension } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { useTheme } from "../../../providers/ThemeProvider";
import {
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../../constants/Languages";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: CodeExecutionLanguage;
}

// C and C++ share the same CodeMirror grammar (@codemirror/lang-cpp) — there's no separate C mode.
const getLanguageExtension = (language: CodeExecutionLanguage): Extension => {
  switch (language) {
    case CodeExecutionLanguages.TYPESCRIPT:
      return javascript({ typescript: true });
    case CodeExecutionLanguages.PYTHON:
      return python();
    case CodeExecutionLanguages.JAVA:
      return java();
    case CodeExecutionLanguages.CPP:
    case CodeExecutionLanguages.C:
      return cpp();
    case CodeExecutionLanguages.JAVASCRIPT:
    default:
      return javascript();
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  readOnly,
  language = CodeExecutionLanguages.JAVASCRIPT,
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <CodeMirror
      value={value}
      height="100%"
      width="100%"
      theme={resolvedTheme}
      // Without line wrapping, a single long line (common when a solution is written on one
      // line) forces CodeMirror's internal scroller to its full content width; since nothing
      // upstream in the split-pane layout applies `min-w-0`, that width bubbles all the way up
      // and overflows the whole page horizontally instead of staying contained in the editor.
      extensions={[getLanguageExtension(language), EditorView.lineWrapping]}
      onChange={onChange}
      readOnly={readOnly}
      basicSetup={{ tabSize: 2 }}
      data-cy="practice-code-editor"
      className="h-full w-full min-w-0 text-sm"
    />
  );
};

export default CodeEditor;
