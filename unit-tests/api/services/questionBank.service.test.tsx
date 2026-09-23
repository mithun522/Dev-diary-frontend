jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchQuestionBankFiles,
  uploadQuestionBankFile,
  deleteQuestionBankFile,
} from "../../../src/api/services/questionBank.service";
import {
  QUESTION_BANK,
  QUESTION_BANK_BY_USER,
  QUESTION_BANK_UPLOAD_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;
const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch as unknown as typeof fetch;
});

const makeFile = (
  name = "notes.pdf",
  type = "application/pdf",
  contents = "some file contents"
) => new File([contents], name, { type });

describe("fetchQuestionBankFiles", () => {
  test("requests the bare /materials/user URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchQuestionBankFiles();
    expect(mockedAxios.get).toHaveBeenCalledWith(QUESTION_BANK_BY_USER);
  });

  test("returns the response body unchanged", async () => {
    const files = [{ id: "f1", fileName: "a.pdf" }];
    mockedAxios.get.mockResolvedValue({ data: files });
    await expect(fetchQuestionBankFiles()).resolves.toBe(files);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchQuestionBankFiles()).rejects.toThrow("Network Error");
  });
});

describe("uploadQuestionBankFile", () => {
  test("requests a presigned upload URL with { fileName, contentType }", async () => {
    const file = makeFile("resume.pdf", "application/pdf");
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockResolvedValueOnce({ data: { id: "f1" } });
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await uploadQuestionBankFile(file);

    expect(mockedAxios.post).toHaveBeenNthCalledWith(1, QUESTION_BANK_UPLOAD_URL, {
      fileName: "resume.pdf",
      contentType: "application/pdf",
    });
  });

  test("PUTs the raw file straight to the presigned S3 URL via bare fetch, not AxiosInstance", async () => {
    const file = makeFile("resume.pdf", "application/pdf");
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockResolvedValueOnce({ data: { id: "f1" } });
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await uploadQuestionBankFile(file);

    expect(mockFetch).toHaveBeenCalledWith("https://s3/put-url", {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });
  });

  test("creates the material record with fileName/fileType/fileKey/fileSizeBytes from the presign response and the original file", async () => {
    const file = makeFile("resume.pdf", "application/pdf", "abcdef");
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockResolvedValueOnce({ data: { id: "f1" } });
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await uploadQuestionBankFile(file);

    expect(mockedAxios.post).toHaveBeenNthCalledWith(2, QUESTION_BANK, {
      fileName: "resume.pdf",
      fileType: "application/pdf",
      fileKey: "k1",
      fileSizeBytes: file.size,
    });
  });

  test("returns the created QuestionBankFile record (second POST's body), not the presign response", async () => {
    const file = makeFile();
    const created = { id: "f1", fileName: "notes.pdf", downloadUrl: "https://cdn/f1" };
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockResolvedValueOnce({ data: created });
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await expect(uploadQuestionBankFile(file)).resolves.toBe(created);
  });

  // BUG: uploadQuestionBankFile never inspects the Response `fetch` resolves with — no
  // `response.ok` / `response.status` check anywhere in questionBank.service.tsx. A failed S3 PUT
  // (auth error, expired presigned URL, bucket policy rejection, etc.) still resolves its promise
  // rather than rejecting, so the code sails on to create a material record pointing at a `fileKey`
  // that was never actually written to S3 — the user is told the upload succeeded when it did not.
  test("BUG: proceeds to create the material record even when the S3 PUT response is ok:false (403)", async () => {
    const file = makeFile();
    const created = { id: "f1", fileName: "notes.pdf" };
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockResolvedValueOnce({ data: created });
    mockFetch.mockResolvedValue({ ok: false, status: 403, statusText: "Forbidden" });

    await expect(uploadQuestionBankFile(file)).resolves.toBe(created);
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  test("propagates rejection when requesting the presigned upload URL fails, and never touches fetch or S3", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(uploadQuestionBankFile(makeFile())).rejects.toThrow("Unauthorized");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("propagates rejection when the fetch PUT to S3 itself rejects, and never creates the material record", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { uploadUrl: "https://s3/put-url", fileKey: "k1" },
    });
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(uploadQuestionBankFile(makeFile())).rejects.toThrow("Failed to fetch");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  test("propagates rejection when creating the material record fails", async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { uploadUrl: "https://s3/put-url", fileKey: "k1" } })
      .mockRejectedValueOnce(new Error("Validation failed"));
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await expect(uploadQuestionBankFile(makeFile())).rejects.toThrow("Validation failed");
  });
});

describe("deleteQuestionBankFile", () => {
  test("DELETEs the per-material /materials/{id} URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteQuestionBankFile("f1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${QUESTION_BANK}/f1`);
  });

  test("resolves to undefined (no body to unwrap)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await expect(deleteQuestionBankFile("f1")).resolves.toBeUndefined();
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteQuestionBankFile("f1")).rejects.toThrow("Forbidden");
  });
});
