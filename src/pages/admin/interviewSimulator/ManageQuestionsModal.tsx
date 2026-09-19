import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { getDifficultyColor } from "../../../utils/colorVariations";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { logger } from "../../../utils/logger";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import type { MockInterview } from "../../../data/interviewData";
import {
  useFetchMockInterviewQuestions,
  useDeleteMockInterviewQuestion,
} from "../../../api/hooks/useAdminInterviewSimulator";
import type { MockInterviewQuestion } from "../../../api/services/adminInterviewSimulator.service";
import QuestionFormModal from "./QuestionFormModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

type ManageQuestionsModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  interview: MockInterview;
};

// A "Manage questions" button on each mock interview row opens this modal, which lists that
// interview's questions with its own add/edit/delete — a nested detail view rather than a second
// full page, since a question only ever exists in the context of one mock interview.
const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  open,
  setOpen,
  interview,
}) => {
  const { data, isLoading, error } = useFetchMockInterviewQuestions(
    interview.id
  );
  const deleteMutation = useDeleteMockInterviewQuestion(interview.id);

  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<MockInterviewQuestion | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const questions = data ?? [];

  const onAdd = () => {
    setSelectedQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const onEdit = (question: MockInterviewQuestion) => {
    setSelectedQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const onAskDelete = (question: MockInterviewQuestion) => {
    setSelectedQuestion(question);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = () => {
    if (!selectedQuestion) return;
    deleteMutation.mutate(selectedQuestion.id, {
      onSuccess: () => {
        toast.success("Question deleted successfully");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete question"));
        logger.error("Error deleting question:", err);
      },
      onSettled: () => {
        setIsConfirmOpen(false);
        setSelectedQuestion(null);
      },
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[95vw] max-w-3xl max-h-[80vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-mock-interview-questions-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Dialog.Title
                className="text-lg font-semibold"
                data-cy="admin-mock-interview-questions-modal-title"
              >
                Questions — {interview.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Manage the questions asked during this mock interview.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-mock-interview-questions-modal-close"
              />
            </Dialog.Close>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              variant="primary"
              size="sm"
              onClick={onAdd}
              data-cy="admin-mock-interview-questions-add-button"
            >
              Add Question
            </Button>
          </div>

          {error ? (
            <p className="text-red-500 text-sm">Failed to fetch questions.</p>
          ) : (
            <Table data-cy="admin-mock-interview-questions-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          <Skeleton className="h-5 w-14 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-12" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-6" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : questions.length > 0 ? (
                  questions.map((question) => (
                    <TableRow
                      key={question.id}
                      data-cy="admin-mock-interview-questions-row"
                    >
                      <TableCell className="font-medium max-w-xs truncate">
                        {question.question}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pascalizeUnderscore(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getDifficultyColor(
                            question.difficulty
                          )} text-white`}
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {question.topics?.map((topic, idx) => (
                            <Badge
                              key={`${question.id}-${idx}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{question.timeLimit ?? "-"} min</TableCell>
                      <TableCell className="flex">
                        <Button
                          className="bg-transparent"
                          data-cy="admin-mock-interview-questions-row-edit"
                        >
                          <Pencil
                            onClick={() => onEdit(question)}
                            className="cursor-pointer text-blue-600 dark:text-blue-400"
                            size={16}
                          />
                        </Button>
                        <Button
                          className="bg-transparent"
                          data-cy="admin-mock-interview-questions-row-delete"
                        >
                          <Trash2
                            onClick={() => onAskDelete(question)}
                            className="text-destructive cursor-pointer"
                            size={18}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No questions added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Dialog.Content>
      </Dialog.Portal>

      {isQuestionFormOpen && (
        <QuestionFormModal
          open={isQuestionFormOpen}
          setOpen={setIsQuestionFormOpen}
          interviewId={interview.id}
          questionData={selectedQuestion}
        />
      )}

      {isConfirmOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Question"
          message="Are you sure you want to delete this question?"
          onCancel={() => setIsConfirmOpen(false)}
          onDelete={onConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </Dialog.Root>
  );
};

export default ManageQuestionsModal;
