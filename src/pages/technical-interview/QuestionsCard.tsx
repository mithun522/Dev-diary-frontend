import { BookOpen, Trash2 } from "lucide-react";
import Button from "../../components/ui/button";
import type { TechnicalQuestion } from "./Index";
import AddTechnicalQuestionForm from "./AddTechInterview";
import MarkdownPreview from "../../components/MarkdownPreview";

interface Props {
  index: number;
  question: TechnicalQuestion;
  onEdit: (question: TechnicalQuestion) => void;
  onDelete: () => void;
}

const QuestionsCard = ({ index, question, onEdit, onDelete }: Props) => {
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
              className="text-dark-foreground opacity-90 text-sm font-sans ml-5 prose dark:prose-invert max-w-none"
              data-cy="tech-interview-rendered-answer"
            >
              <MarkdownPreview source={question.answer} />
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
