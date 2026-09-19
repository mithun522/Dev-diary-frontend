import { useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import ErrorPage from "../../ErrorPage";
import {
  useFetchAdminMaterials,
  useAdminDeleteMaterial,
} from "../../../api/hooks/useAdminModeration";
import type { AdminMaterial } from "../../../api/services/adminModeration.service";
import { formatFileSize } from "../../../utils/fileType";
import { formatDate } from "../../../utils/formatDate";
import { logger } from "../../../utils/logger";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

// The admin material row mirrors QuestionBankFile (see questionBank.service.tsx /
// data/questionBankData.ts) but may carry an owner identifier the per-user shape has no reason to
// declare, since this listing spans every user's materials — read it defensively.
const getMaterialOwner = (material: AdminMaterial): string | undefined => {
  const raw = material as unknown as Record<string, unknown>;
  const candidate =
    raw.ownerEmail ?? raw.userEmail ?? raw.userId ?? material.userId ?? material.userEmail;
  return typeof candidate === "string" ? candidate : undefined;
};

const AdminMaterialsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [materialToDelete, setMaterialToDelete] =
    useState<AdminMaterial | null>(null);

  const {
    data: materials = [],
    isLoading,
    error,
  } = useFetchAdminMaterials();
  const deleteMutation = useAdminDeleteMaterial();

  // The admin listing has no search param (mirrors the per-user endpoint) — filter client-side
  // against the already-fetched list.
  const visibleMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return materials;
    return materials.filter((material) =>
      material.fileName.toLowerCase().includes(query)
    );
  }, [materials, searchQuery]);

  const confirmDelete = () => {
    if (!materialToDelete) return;

    deleteMutation.mutate(materialToDelete.id, {
      onSuccess: () => {
        toast.success("Material deleted successfully");
        setMaterialToDelete(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete material"));
        logger.error("Error deleting material:", err);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch materials" />;

  return (
    <div className="space-y-6" data-cy="admin-materials-page">
      <div>
        <h1 className="text-3xl font-bold">Materials</h1>
        <p className="text-muted-foreground">
          Moderate every user's question-bank materials — remove any file
          regardless of owner.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search materials by file name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-cy="admin-materials-search"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-14" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-6" />
                    </TableCell>
                  </TableRow>
                ))
              ) : visibleMaterials.length > 0 ? (
                visibleMaterials.map((material) => (
                  <TableRow key={material.id} data-cy="admin-materials-row">
                    <TableCell
                      className="font-medium"
                      data-cy="admin-materials-row-name"
                    >
                      {material.fileName}
                    </TableCell>
                    <TableCell>{material.fileType || "-"}</TableCell>
                    <TableCell>
                      {formatFileSize(material.fileSizeBytes)}
                    </TableCell>
                    <TableCell data-cy="admin-materials-row-owner">
                      {getMaterialOwner(material) ?? "—"}
                    </TableCell>
                    <TableCell>
                      {material.createdAt ? formatDate(material.createdAt) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-materials-row-delete"
                        onClick={() => setMaterialToDelete(material)}
                      >
                        <Trash2 className="text-destructive" size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No materials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {materialToDelete && (
        <AskForConfirmationModal
          title="Delete Material"
          message={`Are you sure you want to delete "${materialToDelete.fileName}"? This cannot be undone.`}
          showDelete
          isDeleting={deleteMutation.isPending}
          onCancel={() => setMaterialToDelete(null)}
          onDelete={confirmDelete}
        />
      )}
    </div>
  );
};

export default AdminMaterialsPage;
