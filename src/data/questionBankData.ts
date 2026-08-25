export interface QuestionBankFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  downloadUrl: string;
  createdAt?: string;
  updatedAt?: string;
}
