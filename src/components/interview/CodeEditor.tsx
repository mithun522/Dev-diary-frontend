import { useState, useCallback } from "react";
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
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Use useCallback to prevent unnecessary re-renders
  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      onChange(value);
    },
    [onChange]
  );

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");

    try {
      // Using a free alternative to Judge0 that doesn't require API key
      const submissionResponse = await fetch(
        "https://emkc.org/api/v2/piston/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: language,
            version: getLanguageVersion(language),
            files: [
              {
                content: code,
              },
            ],
          }),
        }
      );

      if (!submissionResponse.ok) {
        throw new Error(`HTTP error! status: ${submissionResponse.status}`);
      }

      const result = await submissionResponse.json();

      if (result.compile && result.compile.stderr) {
        setOutput(`Compilation Error:\n${result.compile.stderr}`);
      } else if (result.run.stderr) {
        setOutput(`Runtime Error:\n${result.run.stderr}`);
      } else {
        setOutput(
          result.run.stdout || "Code executed successfully (no output)"
        );
      }

      toast({
        title: "Code executed",
        description: "Check the output below",
      });
    } catch (error: any) {
      setOutput(
        `Error: ${
          error instanceof Error ? error.message : error.message
        }\n\nNote: Using Piston API - some features may be limited`
      );
      toast({
        title: "Execution error",
        description: "Failed to execute code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Helper function to get language versions
  const getLanguageVersion = (lang: string): string => {
    const versions: { [key: string]: string } = {
      javascript: "18.15.0",
      python: "3.10.0",
      java: "15.0.2",
      cpp: "10.2.0",
      c: "10.2.0",
    };
    return versions[lang] || "latest";
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
          <Button
            size="sm"
            variant="outlinePrimary"
            onClick={copyCode}
            type="button"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outlinePrimary"
            onClick={resetCode}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            type="button"
            className="flex py-2 item-center justify-center"
          >
            <Play className="h-4 w-4 mr-2 mt-0.5" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="font-mono text-sm min-h-[300px] border-0 resize-none"
          placeholder={`Write your ${language} code here...`}
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
