import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import { logger } from "../../../utils/logger";
import {
  useDeleteCase,
  useFetchSystemDesignCases,
} from "../../../api/hooks/useAdminSystemDesign";
import type { SystemDesignCaseRecord } from "../../../api/services/adminSystemDesign.service";
import CaseFormModal from "./CaseFormModal";
import CasesTable from "./CasesTable";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminCasesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<SystemDesignCaseRecord | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useFetchSystemDesignCases();
  const deleteCaseMutation = useDeleteCase();

  const cases = useMemo(() => {
    const all = data ?? [];
    if (!searchQuery.trim()) return all;

    const query = searchQuery.toLowerCase();
    return all.filter(
      (caseItem) =>
        caseItem.title?.toLowerCase().includes(query) ||
        caseItem.summary?.toLowerCase().includes(query) ||
        (caseItem.techStack ?? []).some((tech) => tech.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const onEdit = (caseItem: SystemDesignCaseRecord) => {
    setSelectedCase(caseItem);
    setIsFormModalOpen(true);
  };

  const onDelete = (caseItem: SystemDesignCaseRecord) => {
    setSelectedCase(caseItem);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCase) return;
    setIsDeleting(true);
    try {
      await deleteCaseMutation.mutateAsync(selectedCase.id);
      toast.success("Case deleted successfully");
      setIsConfirmModalOpen(false);
      setSelectedCase(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete case"));
      logger.error("Error deleting system design case:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch system design cases" />;

  return (
    <div className="space-y-6" data-cy="admin-sd-cases-page">
      <div>
        <h1 className="text-3xl font-bold">System Design Cases</h1>
        <p className="text-muted-foreground">
          Manage the case studies shown on the System Design page.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Input
          placeholder="Search cases by title, summary, or tech..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
          data-cy="admin-sd-cases-search"
        />
        <Button
          variant="primary"
          onClick={() => {
            setSelectedCase(null);
            setIsFormModalOpen(true);
          }}
          data-cy="admin-sd-cases-add-button"
        >
          Add Case
        </Button>
      </div>

      <CasesTable isLoading={isLoading} cases={cases} onEdit={onEdit} onDelete={onDelete} />

      {isFormModalOpen && (
        <CaseFormModal
          open={isFormModalOpen}
          setOpen={setIsFormModalOpen}
          caseData={selectedCase}
        />
      )}

      {isConfirmModalOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Case"
          message={`Are you sure you want to delete "${selectedCase?.title}"? This cannot be undone.`}
          onCancel={() => setIsConfirmModalOpen(false)}
          onDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminCasesPage;
