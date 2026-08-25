import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Image,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import ErrorPage from "../ErrorPage";
import {
  useFetchQuestionBank,
  QUESTION_BANK_QUERY_KEY,
} from "../../api/hooks/useFetchQuestionBank";
import { deleteQuestionBankFile } from "../../api/services/questionBank.service";
import type { QuestionBankFile } from "../../data/questionBankData";
import { formatFileSize, getFilePreviewKind } from "../../utils/fileType";
import { formatDate } from "../../utils/formatDate";
import {
  FILE_DELETE_FAILED,
  FILE_DELETE_SUCCESS,
} from "../../constants/ToastMessage";
import UploadQuestionBankModal from "./UploadQuestionBankModal";
import FileViewerModal from "./FileViewerModal";
import QuestionBankShimmer from "./QuestionBankShimmer";

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  csv: FileSpreadsheet,
  image: Image,
  text: FileText,
  other: File,
};

const QuestionBankPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingFile, setViewingFile] = useState<QuestionBankFile | null>(
    null
  );
  const [fileToDelete, setFileToDelete] = useState<QuestionBankFile | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading: isLoadingFetch,
    error: errorFetch,
  } = useFetchQuestionBank();

  // The list endpoint has no search param — it always returns everything, so filtering happens
  // client-side against the already-fetched list.
  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return files;
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

  const handleDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    const deletedId = fileToDelete.id;

    try {
      await deleteQuestionBankFile(deletedId);
      toast.success(FILE_DELETE_SUCCESS);

      queryClient.setQueryData<QuestionBankFile[]>(
        QUESTION_BANK_QUERY_KEY,
        (old) => (old ?? []).filter((file) => file.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: QUESTION_BANK_QUERY_KEY });
    } catch (error) {
      const err = error as AxiosError;
      toast.error(
        (err.response?.data as { message?: string })?.message ||
          FILE_DELETE_FAILED
      );
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  if (errorFetch) {
    return <ErrorPage message="Failed to fetch question bank files" />;
  }

  return (
    <div className="space-y-6" data-cy="question-bank-page">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            Store and read your study materials — PDFs, CSVs, and more.
          </p>
        </div>
        <UploadQuestionBankModal />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-cy="question-bank-search"
        />
      </div>

      {isLoadingFetch ? (
        <QuestionBankShimmer />
      ) : visibleFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFiles.map((file) => {
            const kind = getFilePreviewKind(file.fileName, file.fileType);
            const Icon = FILE_ICONS[kind];

            return (
              <Card key={file.id} data-cy="question-bank-file-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-8 w-8 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="font-medium truncate"
                        title={file.fileName}
                        data-cy="question-bank-file-name"
                      >
                        {file.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSizeBytes)}
                        {file.createdAt && ` · ${formatDate(file.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outlinePrimary"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setViewingFile(file)}
                      data-cy="question-bank-view-button"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outlineDanger"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setFileToDelete(file)}
                      data-cy="question-bank-delete-button"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 justify-center items-center py-12"
          data-cy="question-bank-no-data"
        >
          <File className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {searchQuery ? "No matching files" : "No files yet"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try a different search term."
              : "Upload a PDF, CSV, or any study material to get started."}
          </p>
        </div>
      )}

      <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />

      {fileToDelete && (
        <AskForConfirmationModal
          title="Delete File"
          message={`Are you sure you want to delete "${fileToDelete.fileName}"?`}
          showDelete
          isDeleting={isDeleting}
          onCancel={() => setFileToDelete(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default QuestionBankPage;
