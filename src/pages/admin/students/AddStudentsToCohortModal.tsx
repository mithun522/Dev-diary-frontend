import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Search, X } from "lucide-react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Skeleton } from "../../../components/ui/skeleton";
import { useAdminStudentsProgress } from "../../../api/hooks/useAdminProgress";
import { useAddStudentsToCohort } from "../../../api/hooks/useCohorts";
import { logger } from "../../../utils/logger";

type AddStudentsToCohortModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  cohortId: string;
  // Already-in-this-cohort ids, so they're excluded from the picker - re-adding someone already
  // here is a confusing no-op, not a real action.
  excludeStudentIds: string[];
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

// The roster to pick from comes from dsa-service's admin/students/progress endpoint, not
// auth-service - auth-service has no standalone "list every one of my invited students as real
// user rows" endpoint (GET /invites only returns pending/accepted/expired invite rows, keyed by
// invite id and email, not a resolvable userId). The progress endpoint already resolves exactly
// that roster (userId/firstName/lastName/email) as a side effect of returning progress data, so
// it's reused here rather than duplicating that resolution against a second endpoint.
const AddStudentsToCohortModal: React.FC<AddStudentsToCohortModalProps> = ({
  open,
  setOpen,
  cohortId,
  excludeStudentIds,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const { data: roster, isLoading, isError } = useAdminStudentsProgress();
  const addStudentsMutation = useAddStudentsToCohort(cohortId);

  const excludeSet = useMemo(() => new Set(excludeStudentIds), [excludeStudentIds]);

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (roster ?? [])
      .filter((s) => !excludeSet.has(s.userId))
      .filter((s) => {
        if (!term) return true;
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        return name.includes(term) || s.email.toLowerCase().includes(term);
      });
  }, [roster, excludeSet, search]);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const reset = () => {
    setSearch("");
    setSelected(new Set());
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      const result = await addStudentsMutation.mutateAsync([...selected]);
      const addedCount = result.results.filter((r) => r.status === "added").length;
      toast.success(`Added ${addedCount} of ${selected.size} student(s)`);
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add students"));
      logger.error("Error adding students to cohort:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="add-students-to-cohort-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">Add Students</Dialog.Title>
            <Dialog.Close asChild>
              <X className="text-primary-background cursor-pointer" />
            </Dialog.Close>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-cy="add-students-to-cohort-search"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 border rounded-md p-2">
            {isError ? (
              <p className="text-sm text-destructive py-4 text-center">
                Failed to load your students.
              </p>
            ) : isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            ) : candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {search ? "No students match your search." : "No students left to add."}
              </p>
            ) : (
              candidates.map((student) => (
                <label
                  key={student.userId}
                  className="flex items-center gap-2 rounded-md p-2 cursor-pointer hover:bg-accent"
                  data-cy="add-students-to-cohort-row"
                >
                  <Checkbox
                    checked={selected.has(student.userId)}
                    onCheckedChange={() => toggle(student.userId)}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{student.email}</div>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Dialog.Close asChild>
              <Button type="button" variant="danger">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || selected.size === 0}
              className="min-w-[100px]"
              data-cy="add-students-to-cohort-submit"
            >
              {submitting ? "Adding..." : `Add (${selected.size})`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddStudentsToCohortModal;
