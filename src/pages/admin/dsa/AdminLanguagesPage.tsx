import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import { logger } from "../../../utils/logger";
import {
  useFetchLanguage,
  type LanguageType,
} from "../../../api/hooks/useFetchLanguage";
import { useDeleteLanguage } from "../../../api/hooks/useAdminLanguage";
import AdminLanguageFormModal from "./AdminLanguageFormModal";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminLanguagesPage: React.FC = () => {
  const { data: languages, isLoading, error } = useFetchLanguage();
  const deleteLanguageMutation = useDeleteLanguage();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType | null>(
    null
  );
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = (language: LanguageType) => {
    setSelectedLanguage(language);
    setIsFormModalOpen(true);
  };

  const onDelete = (language: LanguageType) => {
    setSelectedLanguage(language);
    setIsOpenConfirmationModal(true);
  };

  const handleDelete = async () => {
    if (!selectedLanguage) return;
    setIsDeleting(true);
    try {
      await deleteLanguageMutation.mutateAsync(selectedLanguage.id);
      toast.success("Language deleted successfully");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete language"));
      logger.error("Error deleting language:", error);
    } finally {
      setIsDeleting(false);
      setIsOpenConfirmationModal(false);
      setSelectedLanguage(null);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch languages" />;

  return (
    <div className="space-y-6" data-cy="admin-languages-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Languages</h1>
          <p className="text-muted-foreground">
            Manage the programming languages available across the app.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedLanguage(null);
            setIsFormModalOpen(true);
          }}
          data-cy="admin-languages-add-button"
        >
          Add Language
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <TableCell key={i}>
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : languages && languages.length > 0 ? (
                languages.map((language) => (
                  <TableRow key={language.id} data-cy="admin-languages-row">
                    <TableCell
                      className="font-medium"
                      data-cy="admin-languages-row-name"
                    >
                      {language.language}
                    </TableCell>
                    <TableCell className="flex">
                      <Button
                        className="bg-transparent"
                        data-cy="admin-languages-row-edit"
                      >
                        <Pencil
                          onClick={() => onEdit(language)}
                          className="cursor-pointer text-blue-600 dark:text-blue-400"
                          size={16}
                        />
                      </Button>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-languages-row-delete"
                      >
                        <Trash2
                          onClick={() => onDelete(language)}
                          className="text-destructive cursor-pointer"
                          size={18}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-6"
                    data-cy="admin-languages-no-data"
                  >
                    No languages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isFormModalOpen && (
        <AdminLanguageFormModal
          open={isFormModalOpen}
          setOpen={setIsFormModalOpen}
          languageData={selectedLanguage}
        />
      )}
      {isOpenConfirmationModal && (
        <AskForConfirmationModal
          showDelete
          title="Delete Language"
          message={`Are you sure you want to delete "${selectedLanguage?.language}"?`}
          onCancel={() => setIsOpenConfirmationModal(false)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminLanguagesPage;
