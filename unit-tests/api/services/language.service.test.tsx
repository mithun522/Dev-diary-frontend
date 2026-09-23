jest.mock("../../../src/utils/AxiosInstance");
jest.mock("../../../src/utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import AxiosInstance from "../../../src/utils/AxiosInstance";
import { logger } from "../../../src/utils/logger";
import {
  fetchLanguage,
  addLanguage,
} from "../../../src/api/services/language.service";
import { LANGUAGE } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;
const mockedLoggerError = logger.error as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchLanguage", () => {
  test("requests the bare /language URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchLanguage();
    expect(mockedAxios.get).toHaveBeenCalledWith(LANGUAGE);
  });

  test("returns the response body unchanged", async () => {
    const languages = [{ id: "l1", language: "javascript" }];
    mockedAxios.get.mockResolvedValue({ data: languages });
    await expect(fetchLanguage()).resolves.toBe(languages);
  });

  // BUG: unlike every other service function in this codebase (and every sibling in this file's
  // own adminLanguage.service.tsx), fetchLanguage wraps its axios call in a try/catch that logs
  // the error and swallows it instead of rethrowing. A rejected request therefore resolves to
  // `undefined` rather than propagating, so useFetchLanguage's react-query hook sees this as a
  // *successful* fetch of `undefined` data, not an error state — callers get no indication
  // anything went wrong beyond a console/logger line.
  test("BUG: swallows a rejected request and resolves to undefined instead of propagating it", async () => {
    const error = new Error("Network Error");
    mockedAxios.get.mockRejectedValue(error);
    await expect(fetchLanguage()).resolves.toBeUndefined();
  });

  test("BUG: logs the swallowed error via logger.error rather than rethrowing it", async () => {
    const error = new Error("Network Error");
    mockedAxios.get.mockRejectedValue(error);
    await fetchLanguage();
    expect(mockedLoggerError).toHaveBeenCalledWith(error);
  });
});

describe("addLanguage", () => {
  test("POSTs { language: languageName } to /language", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "l1", language: "python" } });
    await addLanguage("python");
    expect(mockedAxios.post).toHaveBeenCalledWith(LANGUAGE, { language: "python" });
  });

  test("sends exactly one field in the body — no other keys", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await addLanguage("go");
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["language"]);
  });

  test("returns the created LanguageType body", async () => {
    const created = { id: "l1", language: "rust" };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(addLanguage("rust")).resolves.toBe(created);
  });

  test("propagates a rejected request rather than swallowing it (no try/catch here, unlike fetchLanguage)", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Conflict"));
    await expect(addLanguage("python")).rejects.toThrow("Conflict");
  });
});
