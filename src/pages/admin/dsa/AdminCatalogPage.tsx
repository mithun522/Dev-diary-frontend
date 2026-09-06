import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import { logger } from "../../../utils/logger";
import { useDebounce } from "../../../api/hooks/use-debounce";
import { useFetchCatalogProblems } from "../../../api/hooks/useFetchCatalog";
import { useDeleteCatalogProblem } from "../../../api/hooks/useAdminCatalog";
import type { CatalogProblem } from "../../../data/catalogData";
import AdminCatalogTable from "./AdminCatalogTable";
import AdminCatalogFormModal from "./AdminCatalogFormModal";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminCatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [selectedProblem, setSelectedProblem] = useState<CatalogProblem | null>(
    null
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 1000);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchCatalogProblems({
    search: debouncedSearch,
    difficulty: difficultyFilter,
  });

  const deleteMutation = useDeleteCatalogProblem();
  const problems = data?.pages?.flatMap((page) => page.problems) ?? [];

  const onEdit = (problem: CatalogProblem) => {
    setSelectedProblem(problem);
    setIsFormModalOpen(true);
  };

  const onDelete = (problem: CatalogProblem) => {
    setSelectedProblem(problem);
    setIsOpenConfirmationModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProblem) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(selectedProblem.id);
      toast.success("Catalog problem deleted successfully");
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete catalog problem"));
      logger.error("Error deleting catalog problem:", err);
    } finally {
      setIsDeleting(false);
      setIsOpenConfirmationModal(false);
      setSelectedProblem(null);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch catalog problems" />;

  return (
    <div className="space-y-6" data-cy="admin-catalog-page">
      <div>
        <h1 className="text-3xl font-bold">DSA Catalog</h1>
        <p className="text-muted-foreground">
          Manage the shared catalog of solvable problems.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search problems by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            data-cy="admin-catalog-search"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger
              className="w-[120px]"
              data-cy="admin-catalog-difficulty-filter-trigger"
            >
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent data-cy="admin-catalog-difficulty-filter-content">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedProblem(null);
              setIsFormModalOpen(true);
            }}
            data-cy="admin-catalog-add-button"
          >
            Add Problem
          </Button>
        </div>
      </div>

      <AdminCatalogTable
        isLoading={isLoading}
        problems={problems}
        onEdit={onEdit}
        onDelete={onDelete}
        fetchNextPage={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />

      {isFormModalOpen && (
        <AdminCatalogFormModal
          open={isFormModalOpen}
          setOpen={setIsFormModalOpen}
          problemId={selectedProblem?.id}
        />
      )}
      {isOpenConfirmationModal && (
        <AskForConfirmationModal
          showDelete
          title="Delete Catalog Problem"
          message={`Are you sure you want to delete "${selectedProblem?.title}"?`}
          onCancel={() => setIsOpenConfirmationModal(false)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminCatalogPage;
