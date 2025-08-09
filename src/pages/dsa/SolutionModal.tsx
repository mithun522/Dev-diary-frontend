import type React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Button from "../../components/ui/button";
import type { DSAProblem } from "../../data/dsaProblemsData";
import { TopicColors, type Topic } from "../../constants/Topics";
import { getDifficultyColor } from "../../utils/colorVariations";

interface SolutionModalProps {
  selectedProblem: DSAProblem;
  setSelectedProblem: React.Dispatch<React.SetStateAction<DSAProblem | null>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SolutionModal: React.FC<SolutionModalProps> = ({
  selectedProblem,
  setSelectedProblem,
  open,
  setOpen,
}) => {
  if (!open || !selectedProblem) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Faded background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          setOpen(false);
          setSelectedProblem(null);
        }}
      />

      {/* Modal Content */}
      <Card className="relative z-50 max-w-3xl w-full mx-4 bg-background shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedProblem.problem}
              <Badge
                variant="outline"
                className={`${getDifficultyColor(
                  selectedProblem.difficulty
                )} text-white`}
              >
                {selectedProblem.difficulty}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setSelectedProblem(null);
              }}
            >
              ×
            </Button>
          </CardTitle>
          <CardDescription>
            <div className="flex flex-wrap gap-1">
              {selectedProblem.topics?.map((topic: Topic, index: number) => (
                <Badge key={index} className={`text-xs ${TopicColors[topic]}`}>
                  {topic}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="solution" className="px-6 pb-6">
          <TabsList>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent
            value="solution"
            className="pt-4 prose prose-pre:bg-muted prose-pre:text-muted-foreground dark:prose-pre:bg-muted/80 max-w-none"
          >
            {selectedProblem.bruteForceSolution ? (
              <MarkdownPreview
                source={`\`\`\`javascript\n${selectedProblem.bruteForceSolution}\n\`\`\``}
              />
            ) : (
              <p>No solution added yet for this problem.</p>
            )}
          </TabsContent>

          <TabsContent value="notes" className="pt-4">
            {selectedProblem.notes ? (
              <p>{selectedProblem.notes}</p>
            ) : (
              <p>No notes added yet for this problem.</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SolutionModal;
