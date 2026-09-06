import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import { logger } from "../../../utils/logger";
import {
  useDeletePattern,
  useFetchScalabilityPatterns,
} from "../../../api/hooks/useAdminSystemDesign";
import type { ScalabilityPatternRecord } from "../../../api/services/adminSystemDesign.service";
import PatternFormModal from "./PatternFormModal";
import PatternsTable from "./PatternsTable";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminPatternsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<ScalabilityPatternRecord | null>(
    null
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useFetchScalabilityPatterns();
  const deletePatternMutation = useDeletePattern();

  const patterns = useMemo(() => {
    const all = data ?? [];
    if (!searchQuery.trim()) return all;

    const query = searchQuery.toLowerCase();
    return all.filter(
      (pattern) =>
        pattern.name?.toLowerCase().includes(query) ||
        pattern.description?.toLowerCase().includes(query) ||
        (pattern.useCases ?? []).some((useCase) => useCase.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  const onEdit = (pattern: ScalabilityPatternRecord) => {
    setSelectedPattern(pattern);
    setIsFormModalOpen(true);
  };

  const onDelete = (pattern: ScalabilityPatternRecord) => {
    setSelectedPattern(pattern);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPattern) return;
    setIsDeleting(true);
    try {
      await deletePatternMutation.mutateAsync(selectedPattern.id);
      toast.success("Pattern deleted successfully");
      setIsConfirmModalOpen(false);
      setSelectedPattern(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete pattern"));
      logger.error("Error deleting scalability pattern:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch scalability patterns" />;

  return (
    <div className="space-y-6" data-cy="admin-sd-patterns-page">
      <div>
        <h1 className="text-3xl font-bold">Scalability Patterns</h1>
        <p className="text-muted-foreground">
          Manage the scalability patterns shown on the System Design page.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Input
          placeholder="Search patterns by name, description, or use case..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
          data-cy="admin-sd-patterns-search"
        />
        <Button
          variant="primary"
          onClick={() => {
            setSelectedPattern(null);
            setIsFormModalOpen(true);
          }}
          data-cy="admin-sd-patterns-add-button"
        >
          Add Pattern
        </Button>
      </div>

      <PatternsTable
        isLoading={isLoading}
        patterns={patterns}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {isFormModalOpen && (
        <PatternFormModal
          open={isFormModalOpen}
          setOpen={setIsFormModalOpen}
          patternData={selectedPattern}
        />
      )}

      {isConfirmModalOpen && (
        <AskForConfirmationModal
          showDelete
          title="Delete Pattern"
          message={`Are you sure you want to delete "${selectedPattern?.name}"? This cannot be undone.`}
          onCancel={() => setIsConfirmModalOpen(false)}
          onDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminPatternsPage;
