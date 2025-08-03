import { BookOpen, Trash2 } from "lucide-react";
import Button from "../../components/ui/button";
import type { TechnicalQuestion } from "./Index";
import AddTechnicalQuestionForm from "./AddTechInterview";

interface Props {
  index: number;
  question: TechnicalQuestion;
  onEdit: (question: TechnicalQuestion) => void;
  onDelete: () => void;
  handleEdit: (question: TechnicalQuestion) => Promise<void>;
}

const QuestionsCard = ({
  index,
  question,
  onEdit,
  onDelete,
  handleEdit,
}: Props) => {
  const renderAnswer = (answer: string) => {
    const points = answer.split(/\d+\.\s/).filter(Boolean);
    const numbers = [...answer.matchAll(/\d+\./g)].map((match) => match[0]);

    // If bullet points found, render as list
    if (numbers.length === points.length) {
      return (
        <div className="flex flex-col">
          <p className="text-xs ml-6 text-gray-700">
            {/\d+\.\s/.test(question.answer) ? (
              question.answer
                .split(/(\d+\.)\s+/)
                .reduce<string[]>(
                  (acc: string[], val: string, i: number, arr: string[]) => {
                    if (val.match(/\d+\./)) {
                      acc.push(`${val} ${arr[i + 1]}`);
                    } else {
                      return acc;
                    }
                    return acc;
                  },
                  []
                )
                .map((point: string, index: number) => (
                  <div className="flex flex-col" key={index}>
                    {point}
                  </div>
                ))
            ) : (
              <div className="flex flex-col">{question.answer}</div>
            )}
          </p>
        </div>
      );
    }

    // If no numbered bullets, render as paragraph
    return <div className="text-sm ml-6">{answer}</div>;
  };

  return (
    <div className="h-fit max-h-[100vh]">
      <div className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <h4 className="text-sm font-medium line-clamp-2">
              {index + 1 + "."} {question.question}
            </h4>
            <div className="text-gray-700">{renderAnswer(question.answer)}</div>
          </div>
          <div className="flex flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
              <BookOpen className="h-3 w-3" />
            </Button>
            <AddTechnicalQuestionForm
              isEdit={true}
              row={question}
              onAddOrEdit={() => handleEdit(question)} // required, passed from parent if needed
            />
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
