import { useState } from "react";
import { Textarea } from "../../components/ui/textarea";
import Button from "../../components/ui/button";
import { Play, Copy, RotateCcw } from "lucide-react";
import { useToast } from "../../api/hooks/use-toast";

interface CodeEditorProps {
  initialCode: string;
  onChange: (code: string) => void;
  language: string;
}

const CodeEditor = ({ initialCode, onChange, language }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleCodeChange = (value: string) => {
    setCode(value);
    onChange(value);
  };

  const runCode = () => {
    try {
      // Simple JavaScript execution for demo purposes
      // In a real app, you'd use a sandboxed execution environment
      const result = eval(code);
      setOutput(String(result));
      toast({
        title: "Code executed",
        description: "Check the output below",
      });
    } catch (error) {
      setOutput(`Error: ${error}`);
      toast({
        title: "Execution error",
        description: "Check your code for syntax errors",
        variant: "destructive",
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const resetCode = () => {
    setCode(initialCode);
    onChange(initialCode);
    setOutput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Code Editor ({language})</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outlinePrimary" onClick={copyCode}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outlinePrimary" onClick={resetCode}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={runCode}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="font-mono text-sm min-h-[300px] border-0 resize-none"
          placeholder="Write your code here..."
        />
      </div>

      {output && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="text-gray-400 mb-2">Output:</div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
