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
import { Skeleton } from "../../../components/ui/skeleton";
import { Pencil, Trash2, ListChecks } from "lucide-react";
import { getDifficultyColor } from "../../../utils/colorVariations";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import type { MockInterview } from "../../../data/interviewData";
import {
  useFetchMockInterviews,
  useDeleteMockInterview,
} from "../../../api/hooks/useAdminInterviewSimulator";
import MockInterviewFormModal from "./MockInterviewFormModal";
import ManageQuestionsModal from "./ManageQuestionsModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const AdminMockInterviewsPage: React.FC = () => {
  const { data, isLoading, error } = useFetchMockInterviews();
  const deleteMutation = useDeleteMockInterview();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<MockInterview | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [questionsInterview, setQuestionsInterview] =
    useState<MockInterview | null>(null);

  const interviews = data ?? [];

  const onAdd = () => {
    setSelectedInterview(null);
    setIsFormOpen(true);
  };

  const onEdit = (interview: MockInterview) => {
    setSelectedInterview(interview);
    setIsFormOpen(true);
  };

  const onAskDelete = (interview: MockInterview) => {
    setSelectedInterview(interview);
    setIsConfirmOpen(true);
  };

  const onManageQuestions = (interview: MockInterview) => {
    setQuestionsInterview(interview);
    setIsQuestionsModalOpen(true);
  };

  const onConfirmDelete = () => {
    if (!selectedInterview) return;
    deleteMutation.mutate(selectedInterview.id, {
      onSuccess: () => {
        toast.success("Mock interview deleted successfully");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete mock interview"));
        logger.error("Error deleting mock interview:", err);
      },
      onSettled: () => {
        setIsConfirmOpen(false);
        setSelectedInterview(null);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch mock interviews" />;

  return (
    <div className="space-y-6" data-cy="admin-mock-interviews-page">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Mock Interviews</h1>
          <p className="text-muted-foreground">
            Manage the mock interviews and their questions shown in the
            Interview Simulator.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onAdd}
          data-cy="admin-mock-interviews-add-button"
        >
          Add Mock Interview
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-mock-interviews-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : interviews.length > 0 ? (
                interviews.map((interview) => (
                  <TableRow
                    key={interview.id}
                    data-cy="admin-mock-interviews-row"
                  >
                    <TableCell
                      className="font-medium"
                      data-cy="admin-mock-interviews-row-title"
                    >
                      {interview.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getDifficultyColor(
                          interview.difficulty
                        )} text-white`}
                      >
                        {interview.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{interview.duration} mins</TableCell>
                    <TableCell>{interview.rating}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {interview.topics?.map((topic, idx) => (
                          <Badge
                            key={`${interview.id}-${idx}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center">
                      <Button
                        variant="outlinePrimary"
                        size="sm"
                        className="flex items-center gap-1 mr-2"
                        onClick={() => onManageQuestions(interview)}
                        data-cy="admin-mock-interviews-row-manage-questions"
                      >
                        <ListChecks className="h-4 w-4" />
                        Questions
                      </Button>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-mock-interviews-row-edit"
                      >
                        <Pencil
                          onClick={() => onEdit(interview)}
                          className="cursor-pointer text-blue-600 dark:text-blue-400"
                          size={16}
                        />
                      </Button>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-mock-interviews-row-delete"
                      >
                        <Trash2
                          onClick={() => onAskDelete(interview)}
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
                    No mock interviews found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <MockInterviewFormModal
          open={isFormOpen}
          setOpen={setIsFormOpen}
          interviewData={selectedInterview}
        />
      )}

      {isConfirmOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Mock Interview"
          message={`Are you sure you want to delete "${selectedInterview?.title}"? Its questions will be removed as well.`}
          onCancel={() => setIsConfirmOpen(false)}
          onDelete={onConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {isQuestionsModalOpen && questionsInterview && (
        <ManageQuestionsModal
          open={isQuestionsModalOpen}
          setOpen={setIsQuestionsModalOpen}
          interview={questionsInterview}
        />
      )}
    </div>
  );
};

export default AdminMockInterviewsPage;
