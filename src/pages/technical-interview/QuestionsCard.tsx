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
    if (!answer) return null;

    const hasNumberedPoints = /^\s*\d+\.\s/m.test(answer);

    // --- Plain prose: split into paragraphs on blank lines ---
    if (!hasNumberedPoints) {
      const paragraphs = answer.split(/\n\s*\n/).filter((p) => p.trim() !== "");
      return (
        <div className="ml-5 space-y-2">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-sm font-sans whitespace-pre-line leading-relaxed"
            >
              {para.trim()}
            </p>
          ))}
        </div>
      );
    }

    // --- Numbered points path (your existing logic) ---
    const firstPointMatch = answer.match(/\d+\.\s/);
    if (!firstPointMatch) {
      return (
        <p className="text-sm ml-5 font-sans whitespace-pre-line leading-relaxed">
          {answer}
        </p>
      );
    }

    const firstPointIndex = answer.indexOf(firstPointMatch[0]);
    const beforePoints = answer.substring(0, firstPointIndex).trim();
    const pointsSection = answer.substring(firstPointIndex);

    const lines = pointsSection.split("\n");
    const processedLines: AnswerPart[] = [];

    lines.forEach((line) => {
      if (line.trim() === "") {
        processedLines.push({ type: "empty", content: "" });
        return;
      }
      const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numberedMatch) {
        processedLines.push({
          type: "numbered",
          number: numberedMatch[1],
          content: numberedMatch[2],
        });
        return;
      }
      const subPointMatch = line.match(/^\s*([a-z])\.\s(.*)$/);
      if (subPointMatch) {
        processedLines.push({
          type: "subpoint",
          letter: subPointMatch[1],
          content: subPointMatch[2],
        });
        return;
      }
      processedLines.push({ type: "content", content: line });
    });

    const numberedPointMargin = beforePoints ? "ml-10" : "ml-5";
    const subPointMargin = "ml-15";

    return (
      <div>
        {beforePoints && (
          <p className="text-sm ml-5 font-sans mb-2 whitespace-pre-line leading-relaxed">
            {beforePoints}
          </p>
        )}
        <div>
          {processedLines.map((line, i) => {
            if (line.type === "empty") return <div key={i} className="h-2" />;
            if (line.type === "numbered") {
              return (
                <div key={i} className={`flex ${numberedPointMargin} mb-1`}>
                  <span className="text-sm font-sans mr-2">{line.number}.</span>
                  <p className="text-sm font-sans">{line.content}</p>
                </div>
              );
            }
            if (line.type === "subpoint") {
              return (
                <div key={i} className={`flex ${subPointMargin} mb-1`}>
                  <span className="text-sm font-sans mr-2">{line.letter}.</span>
                  <p className="text-sm font-sans">{line.content}</p>
                </div>
              );
            }
            return (
              <p
                key={i}
                className={`text-sm font-sans ${numberedPointMargin} mb-1`}
              >
                {line.content}
              </p>
            );
          })}
        </div>
      </div>
    );
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
              className="text-dark-foreground opacity-90 text-sm font-sans"
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
