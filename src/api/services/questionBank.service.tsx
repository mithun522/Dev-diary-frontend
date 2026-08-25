import {
  QUESTION_BANK,
  QUESTION_BANK_BY_USER,
  QUESTION_BANK_UPLOAD_URL,
} from "../../constants/Api";
import type { QuestionBankFile } from "../../data/questionBankData";
import AxiosInstance from "../../utils/AxiosInstance";

export const fetchQuestionBankFiles = async (): Promise<
  QuestionBankFile[]
> => {
  const response = await AxiosInstance.get(QUESTION_BANK_BY_USER);
  return response.data;
};

/**
 * Requests a presigned S3 upload URL, uploads the file directly to S3 (bypassing our API, same
 * as the blog cover-image flow), then creates the material record referencing the resulting key.
 */
export const uploadQuestionBankFile = async (
  file: File
): Promise<QuestionBankFile> => {
  const uploadUrlResponse = await AxiosInstance.post(QUESTION_BANK_UPLOAD_URL, {
    fileName: file.name,
    contentType: file.type,
  });
  const { uploadUrl, fileKey } = uploadUrlResponse.data;

  // Plain fetch, not AxiosInstance — this goes straight to S3, not our API, so it must not carry
  // our Authorization header or any of our interceptors.
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const response = await AxiosInstance.post(QUESTION_BANK, {
    fileName: file.name,
    fileType: file.type,
    fileKey,
    fileSizeBytes: file.size,
  });

  return response.data;
};

export const deleteQuestionBankFile = async (id: string): Promise<void> => {
  await AxiosInstance.delete(`${QUESTION_BANK}/${id}`);
};
