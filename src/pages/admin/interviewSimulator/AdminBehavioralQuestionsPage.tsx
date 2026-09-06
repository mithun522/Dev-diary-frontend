import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import type { BehavioralQuestion } from "../../../data/interviewData";
import {
  useFetchBehavioralQuestions,
  useDeleteBehavioralQuestion,
} from "../../../api/hooks/useAdminInterviewSimulator";
import BehavioralQuestionFormModal from "./BehavioralQuestionFormModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const AdminBehavioralQuestionsPage: React.FC = () => {
  const { data, isLoading, error } = useFetchBehavioralQuestions();
  const deleteMutation = useDeleteBehavioralQuestion();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<BehavioralQuestion | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const questions = data ?? [];

  const onAdd = () => {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  };

  const onEdit = (question: BehavioralQuestion) => {
    setSelectedQuestion(question);
    setIsFormOpen(true);
  };

  const onAskDelete = (question: BehavioralQuestion) => {
    setSelectedQuestion(question);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = () => {
    if (!selectedQuestion) return;
    deleteMutation.mutate(selectedQuestion.id, {
      onSuccess: () => {
        toast.success("Behavioral question deleted successfully");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete behavioral question"));
        logger.error("Error deleting behavioral question:", err);
      },
      onSettled: () => {
        setIsConfirmOpen(false);
        setSelectedQuestion(null);
      },
    });
  };

  if (error)
    return <ErrorPage message="Failed to fetch behavioral questions" />;

  return (
    <div className="space-y-6" data-cy="admin-behavioral-questions-page">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Behavioral Questions</h1>
          <p className="text-muted-foreground">
            Manage the behavioral interview question bank.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onAdd}
          data-cy="admin-behavioral-questions-add-button"
        >
          Add Behavioral Question
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-behavioral-questions-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tips</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TableCell key={i}>
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : questions.length > 0 ? (
                questions.map((question) => (
                  <TableRow
                    key={question.id}
                    data-cy="admin-behavioral-questions-row"
                  >
                    <TableCell
                      className="font-medium"
                      data-cy="admin-behavioral-questions-row-question"
                    >
                      {question.question}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {question.tips?.map((tip, idx) => (
                          <Badge
                            key={`${question.id}-${idx}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tip}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="flex">
                      <Button
                        className="bg-transparent"
                        data-cy="admin-behavioral-questions-row-edit"
                      >
                        <Pencil
                          onClick={() => onEdit(question)}
                          className="cursor-pointer text-blue-600 dark:text-blue-400"
                          size={16}
                        />
                      </Button>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-behavioral-questions-row-delete"
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
                  <TableCell colSpan={4} className="text-center py-6">
                    No behavioral questions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <BehavioralQuestionFormModal
          open={isFormOpen}
          setOpen={setIsFormOpen}
          questionData={selectedQuestion}
        />
      )}

      {isConfirmOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Behavioral Question"
          message="Are you sure you want to delete this behavioral question?"
          onCancel={() => setIsConfirmOpen(false)}
          onDelete={onConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminBehavioralQuestionsPage;
