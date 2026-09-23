jest.mock("../../../src/api/services/questionBank.service");

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  QUESTION_BANK_QUERY_KEY,
  useFetchQuestionBank,
} from "../../../src/api/hooks/useFetchQuestionBank";
import { fetchQuestionBankFiles } from "../../../src/api/services/questionBank.service";
import type { QuestionBankFile } from "../../../src/data/questionBankData";

const mockedFetchQuestionBankFiles = fetchQuestionBankFiles as jest.MockedFunction<
  typeof fetchQuestionBankFiles
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const file: QuestionBankFile = {
  id: "f1",
  fileName: "notes.pdf",
  fileType: "application/pdf",
  fileSizeBytes: 1024,
  downloadUrl: "https://example.com/notes.pdf",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchQuestionBank", () => {
  test("the exported QUESTION_BANK_QUERY_KEY is exactly what the hook registers in the cache", async () => {
    mockedFetchQuestionBankFiles.mockResolvedValue([file]);
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchQuestionBank(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(QUESTION_BANK_QUERY_KEY)).toEqual([file]);
    expect(QUESTION_BANK_QUERY_KEY).toEqual(["questionBank"]);
  });

  test("calls fetchQuestionBankFiles with no arguments", async () => {
    mockedFetchQuestionBankFiles.mockResolvedValue([]);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchQuestionBank(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchQuestionBankFiles).toHaveBeenCalledTimes(1);
  });

  test("surfaces a rejected fetch as an error state rather than swallowing it", async () => {
    mockedFetchQuestionBankFiles.mockRejectedValue(new Error("Network Error"));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchQuestionBank(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("Network Error"));
  });
});
