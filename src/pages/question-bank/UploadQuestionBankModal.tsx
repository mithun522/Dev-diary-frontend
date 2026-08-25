import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import Button from "../../components/ui/button";
import { uploadQuestionBankFile } from "../../api/services/questionBank.service";
import {
  QUESTION_BANK_QUERY_KEY,
} from "../../api/hooks/useFetchQuestionBank";
import type { QuestionBankFile } from "../../data/questionBankData";
import {
  FILE_UPLOAD_FAILED,
  FILE_UPLOAD_SUCCESS,
} from "../../constants/ToastMessage";

// Must match MaterialUploadUrlRequest.contentType's enum in the question-bank-service OpenAPI —
// API Gateway rejects anything else with a 400 before it ever reaches the Lambda.
const ACCEPTED_TYPES =
  ".pdf,.csv,.xls,.txt,.doc,.docx,application/pdf,text/csv,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const UploadQuestionBankModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadQuestionBankFile(selectedFile);

      queryClient.setQueryData<QuestionBankFile[]>(
        QUESTION_BANK_QUERY_KEY,
        (old) => [uploaded, ...(old ?? [])]
      );
      queryClient.invalidateQueries({ queryKey: QUESTION_BANK_QUERY_KEY });

      toast.success(FILE_UPLOAD_SUCCESS);
      handleClose();
    } catch (error) {
      const err = error as AxiosError;
      toast.error(
        (err.response?.data as { message?: string })?.message ||
          FILE_UPLOAD_FAILED
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="primary"
          className="flex items-center gap-2 whitespace-nowrap"
          data-cy="question-bank-upload-button"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent onClose={handleClose} data-cy="question-bank-upload-modal">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="question-bank-file">File</Label>
          <Input
            id="question-bank-file"
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            data-cy="question-bank-file-input"
          />
          <p className="text-xs text-muted-foreground">
            PDF, CSV, Excel, Word, or plain text files only.
          </p>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {selectedFile.name}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outlinePrimary"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center justify-center gap-2 min-w-[80px]"
            data-cy="question-bank-upload-submit"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadQuestionBankModal;
