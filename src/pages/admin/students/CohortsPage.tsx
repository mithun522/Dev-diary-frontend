import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Skeleton } from "../../../components/ui/skeleton";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import { useCohorts, useDeleteCohort } from "../../../api/hooks/useCohorts";
import type { Cohort } from "../../../data/cohortData";
import { formatDate } from "../../../utils/formatDate";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";
import CohortFormModal from "./CohortFormModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

// Named groups of the admin's own invited students - a reusable target for bulk operations
// (assigning interviews, viewing progress by batch) elsewhere in the app.
const CohortsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cohorts, isLoading, isError } = useCohorts();
  const deleteCohortMutation = useDeleteCohort();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [deletingCohort, setDeletingCohort] = useState<Cohort | null>(null);

  if (isError) return <ErrorPage message="Failed to load cohorts" />;

  const openCreate = () => {
    setEditingCohort(null);
    setFormOpen(true);
  };

  const openRename = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCohort) return;
    try {
      await deleteCohortMutation.mutateAsync(deletingCohort.id);
      toast.success("Cohort deleted");
      setDeletingCohort(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete cohort"));
      logger.error("Error deleting cohort:", error);
    }
  };

  return (
    <div className="space-y-4" data-cy="admin-cohorts-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cohorts</h1>
          <p className="text-muted-foreground text-sm">
            Group your invited students into batches for bulk actions.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2"
          data-cy="admin-cohorts-create"
        >
          <Plus size={16} />
          New Cohort
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !cohorts || cohorts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No cohorts yet.
                  </TableCell>
                </TableRow>
              ) : (
                cohorts.map((cohort) => (
                  <TableRow key={cohort.id} data-cy="admin-cohort-row">
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/students/cohorts/${cohort.id}`)}
                      data-cy="admin-cohort-name"
                    >
                      {cohort.name}
                    </TableCell>
                    <TableCell>{cohort.studentCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(cohort.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outlinePrimary"
                          className="p-2"
                          onClick={() => openRename(cohort)}
                          data-cy="admin-cohort-rename"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="danger"
                          className="p-2"
                          onClick={() => setDeletingCohort(cohort)}
                          data-cy="admin-cohort-delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CohortFormModal open={formOpen} setOpen={setFormOpen} cohort={editingCohort} />

      {deletingCohort && (
        <AskForConfirmationModal
          title="Delete Cohort"
          message={`Delete "${deletingCohort.name}"? Its ${deletingCohort.studentCount} student(s) will be unassigned, not removed from your roster.`}
          showDelete
          onDelete={confirmDelete}
          onCancel={() => setDeletingCohort(null)}
          isDeleting={deleteCohortMutation.isPending}
        />
      )}
    </div>
  );
};

export default CohortsPage;
