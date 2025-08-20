import { BookOpen, Trash2 } from "lucide-react";
import Button from "../../components/ui/button";
import type { TechnicalQuestion } from "./Index";
import AddTechnicalQuestionForm from "./AddTechInterview";

interface Props {
  index: number;
  question: TechnicalQuestion;
  onEdit: (question: TechnicalQuestion) => void;
  onDelete: () => void;
}

interface AnswerPart {
  type: "empty" | "numbered" | "subpoint" | "content";
  number?: string;
  content: string;
  letter?: string;
}

const QuestionsCard = ({ index, question, onEdit, onDelete }: Props) => {
  const renderAnswer = (answer: string) => {
    // Check if the answer contains numbered points
    const hasNumberedPoints = /\d+\.\s/.test(answer);

    if (hasNumberedPoints) {
      // Split the answer into parts: before first point and the numbered points
      const firstPointMatch = answer.match(/\d+\.\s/);
      if (!firstPointMatch) {
        return <pre className="text-sm ml-5 font-sans">{answer}</pre>;
      }

      const firstPointIndex = answer.indexOf(firstPointMatch[0]);
      const beforePoints = answer.substring(0, firstPointIndex).trim();
      const pointsSection = answer.substring(firstPointIndex);

      // Split into lines to process each line individually
      const lines = pointsSection.split("\n");
      const processedLines: AnswerPart[] = [];

      lines.forEach((line) => {
        if (line.trim() === "") {
          processedLines.push({ type: "empty", content: "" });
          return;
        }

        // Check for numbered points (1. 2. 3. etc.)
        const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
        if (numberedMatch) {
          processedLines.push({
            type: "numbered",
            number: numberedMatch[1],
            content: numberedMatch[2],
          });
          return;
        }

        // Check for sub-points (a. b. c. etc.) - they usually have indentation
        const subPointMatch = line.match(/^\s*([a-z])\.\s(.*)$/);
        if (subPointMatch) {
          processedLines.push({
            type: "subpoint",
            letter: subPointMatch[1],
            content: subPointMatch[2],
          });
          return;
        }

        // Regular content line
        processedLines.push({
          type: "content",
          content: line,
        });
      });

      // Determine margins based on beforePoints existence
      const numberedPointMargin = beforePoints ? "ml-10" : "ml-5";
      const subPointMargin = "ml-15";

      return (
        <div>
          {beforePoints && (
            <p className="text-sm ml-5 font-sans mb-2">{beforePoints}</p>
          )}
          <div>
            {processedLines.map((line, index) => {
              if (line.type === "empty") {
                return <div key={index} className="h-2"></div>;
              }

              if (line.type === "numbered") {
                return (
                  <div
                    key={index}
                    className={`flex ${numberedPointMargin} mb-1`}
                  >
                    <span className="text-sm font-sans mr-2">
                      {line.number}.
                    </span>
                    <p className="text-sm font-sans">{line.content}</p>
                  </div>
                );
              }

              if (line.type === "subpoint") {
                return (
                  <div key={index} className={`flex ${subPointMargin} mb-1`}>
                    <span className="text-sm font-sans mr-2">
                      {line.letter}.
                    </span>
                    <p className="text-sm font-sans">{line.content}</p>
                  </div>
                );
              }

              // Regular content
              return (
                <p
                  key={index}
                  className={`text-sm font-sans ${numberedPointMargin} mb-1`}
                >
                  {line.content}
                </p>
              );
            })}
          </div>
        </div>
      );
    }

    // If no numbered points, apply normal margin
    return <p className="text-sm ml-5 font-sans">{answer}</p>;
  };

  return (
    <div className="h-fit max-h-[100vh]">
      <div className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <h4
              className="text-sm font-medium line-clamp-2"
              data-cy="tech-interview-rendered-question"
            >
              {index + 1 + "."} {question.question}
            </h4>
            <div
              className="text-gray-700"
              data-cy="tech-interview-rendered-answer"
            >
              {renderAnswer(question.answer)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              <BookOpen className="h-3 w-3" />
            </Button>
            <AddTechnicalQuestionForm isEdit={true} row={question} />
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsCard;
