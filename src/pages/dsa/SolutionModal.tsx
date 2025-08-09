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
import { MoveLeft, MoveRightIcon } from "lucide-react";
import { useState } from "react";

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
  const [index, setIndex] = useState<number>(0);

  if (!open || !selectedProblem) return null;

  const solutionMapper = () => {
    return [
      {
        label: "Brute Force",
        code: selectedProblem.bruteForceSolution,
      },
      {
        label: "Better",
        code: selectedProblem.betterSolution,
      },
      {
        label: "Optimised",
        code: selectedProblem.optimisedSolution,
      },
    ].filter((solution) => solution.code); // remove empty solutions
  };

  const moveNext = () => {
    if (index < solutionMapper().length - 1) {
      setIndex(index + 1);
    }
  };
  const movePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

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
            {selectedProblem ? (
              <div className="w-full min-h-[200px]">
                <h3 className="text-lg font-semibold mb-2">{`Solution ${
                  index + 1
                }: ${solutionMapper()[index].label}`}</h3>
                <div className="flex flex-1">
                  <Button variant="ghost" onClick={movePrevious}>
                    <MoveLeft />
                  </Button>
                  <MarkdownPreview
                    className="w-full"
                    source={`\`\`\`javascript\n${
                      solutionMapper()[index].code
                    }\n\`\`\``}
                  />
                  <Button variant="ghost" onClick={moveNext}>
                    <MoveRightIcon />
                  </Button>
                </div>
              </div>
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
