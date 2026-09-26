import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import {
  useCohorts,
  useCohortStudents,
  useRemoveStudentFromCohort,
} from "../../../api/hooks/useCohorts";
import type { CohortStudent } from "../../../data/cohortData";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";
import AddStudentsToCohortModal from "./AddStudentsToCohortModal";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const CohortDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cohortId = id as string;

  // The cohorts list already has this cohort's name (no separate "get one cohort" endpoint
  // exists), so it's sourced from there rather than re-fetching something new.
  const { data: cohorts } = useCohorts();
  const cohort = cohorts?.find((c) => c.id === cohortId);

  const { data: students, isLoading, isError } = useCohortStudents(cohortId);
  const removeStudentMutation = useRemoveStudentFromCohort(cohortId);

  const [addOpen, setAddOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<CohortStudent | null>(null);

  if (isError) return <ErrorPage message="Failed to load this cohort's students" />;

  const confirmRemove = async () => {
    if (!removingStudent) return;
    try {
      await removeStudentMutation.mutateAsync(removingStudent.id);
      toast.success("Student removed from cohort");
      setRemovingStudent(null);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove student"));
      logger.error("Error removing student from cohort:", error);
    }
  };

  return (
    <div className="space-y-4" data-cy="admin-cohort-detail-page">
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/students/cohorts")}
        className="px-2 py-1 text-sm flex items-center gap-1"
        data-cy="admin-cohort-detail-back"
      >
        <ArrowLeft size={16} />
        Back to Cohorts
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{cohort?.name ?? "Cohort"}</h1>
          <p className="text-muted-foreground text-sm">
            {students?.length ?? 0} student{students?.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2"
          data-cy="admin-cohort-add-students"
        >
          <Plus size={16} />
          Add Students
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
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
              ) : !students || students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No students in this cohort yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} data-cy="admin-cohort-student-row">
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "outline"}>
                        {student.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="danger"
                        className="p-2"
                        onClick={() => setRemovingStudent(student)}
                        data-cy="admin-cohort-remove-student"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddStudentsToCohortModal
        open={addOpen}
        setOpen={setAddOpen}
        cohortId={cohortId}
        excludeStudentIds={(students ?? []).map((s) => s.id)}
      />

      {removingStudent && (
        <AskForConfirmationModal
          title="Remove Student"
          message={`Remove ${removingStudent.firstName} ${removingStudent.lastName} from this cohort? They'll remain in your roster, just unassigned.`}
          showDelete
          onDelete={confirmRemove}
          onCancel={() => setRemovingStudent(null)}
          isDeleting={removeStudentMutation.isPending}
        />
      )}
    </div>
  );
};

export default CohortDetailPage;
