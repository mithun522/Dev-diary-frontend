import { useState, useEffect } from "react";
import { Textarea } from "../../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import Button from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Eye, Code, RefreshCw } from "lucide-react";

interface FrontendSandboxProps {
  initialCode?: {
    html?: string;
    css?: string;
    js?: string;
  };
  onChange: (code: { html: string; css: string; js: string }) => void;
}

const FrontendSandbox = ({ initialCode, onChange }: FrontendSandboxProps) => {
  const [html, setHtml] = useState(initialCode?.html || "");
  const [css, setCss] = useState(initialCode?.css || "");
  const [js, setJs] = useState(initialCode?.js || "");
  const [previewKey, setPreviewKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const combinedCode = { html, css, js };

  useEffect(() => {
    onChange(combinedCode);
  }, [onChange, combinedCode]);

  const generatePreview = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: system-ui, -apple-system, sans-serif; 
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              document.body.innerHTML += '<div style="color: red; background: #ffe6e6; padding: 10px; margin: 10px 0; border-radius: 4px;">Error: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
  };

  const refreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 h-[600px]">
      {/* Code Editors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="html" className="h-full">
            <div className="px-6 pb-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="html" className="px-6 pb-6 mt-0">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-none"
                placeholder="Write your HTML here..."
              />
            </TabsContent>

            <TabsContent value="css" className="px-6 pb-6 mt-0">
              <Textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-none"
                placeholder="Write your CSS here..."
              />
            </TabsContent>

            <TabsContent value="js" className="px-6 pb-6 mt-0">
              <Textarea
                value={js}
                onChange={(e) => setJs(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-none"
                placeholder="Write your JavaScript here..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <Button size="sm" variant="outlinePrimary" onClick={refreshPreview}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg mx-6 mb-6 overflow-hidden">
            <iframe
              key={previewKey}
              srcDoc={generatePreview()}
              className="w-full h-[450px] border-0"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrontendSandbox;
