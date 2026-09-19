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
import { Pencil, Trash2 } from "lucide-react";
import { getDifficultyColor } from "../../../utils/colorVariations";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import type { CompanyProblem } from "../../../data/interviewData";
import {
  useFetchCompanyProblems,
  useDeleteCompanyProblem,
} from "../../../api/hooks/useAdminInterviewSimulator";
import CompanyProblemFormModal from "./CompanyProblemFormModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const AdminCompanyProblemsPage: React.FC = () => {
  const { data, isLoading, error } = useFetchCompanyProblems();
  const deleteMutation = useDeleteCompanyProblem();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] =
    useState<CompanyProblem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const problems = data ?? [];

  const onAdd = () => {
    setSelectedProblem(null);
    setIsFormOpen(true);
  };

  const onEdit = (problem: CompanyProblem) => {
    setSelectedProblem(problem);
    setIsFormOpen(true);
  };

  const onAskDelete = (problem: CompanyProblem) => {
    setSelectedProblem(problem);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = () => {
    if (!selectedProblem) return;
    deleteMutation.mutate(selectedProblem.id, {
      onSuccess: () => {
        toast.success("Company problem deleted successfully");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete company problem"));
        logger.error("Error deleting company problem:", err);
      },
      onSettled: () => {
        setIsConfirmOpen(false);
        setSelectedProblem(null);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch company problems" />;

  return (
    <div className="space-y-6" data-cy="admin-company-problems-page">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Company Problems</h1>
          <p className="text-muted-foreground">
            Manage the company-specific practice problems shown in the
            Interview Simulator.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onAdd}
          data-cy="admin-company-problems-add-button"
        >
          Add Company Problem
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-company-problems-table">
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : problems.length > 0 ? (
                problems.map((problem) => (
                  <TableRow
                    key={problem.id}
                    data-cy="admin-company-problems-row"
                  >
                    <TableCell className="font-medium capitalize">
                      {problem.company}
                    </TableCell>
                    <TableCell>
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        data-cy="admin-company-problems-row-title"
                      >
                        {problem.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getDifficultyColor(
                          problem.difficulty
                        )} text-white`}
                      >
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.map((tag, idx) => (
                          <Badge
                            key={`${problem.id}-${idx}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="flex">
                      <Button
                        className="bg-transparent"
                        data-cy="admin-company-problems-row-edit"
                      >
                        <Pencil
                          onClick={() => onEdit(problem)}
                          className="cursor-pointer text-blue-600 dark:text-blue-400"
                          size={16}
                        />
                      </Button>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-company-problems-row-delete"
                      >
                        <Trash2
                          onClick={() => onAskDelete(problem)}
                          className="text-destructive cursor-pointer"
                          size={18}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No company problems found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CompanyProblemFormModal
          open={isFormOpen}
          setOpen={setIsFormOpen}
          problemData={selectedProblem}
        />
      )}

      {isConfirmOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Company Problem"
          message={`Are you sure you want to delete "${selectedProblem?.title}"?`}
          onCancel={() => setIsConfirmOpen(false)}
          onDelete={onConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminCompanyProblemsPage;
