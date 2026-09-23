jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  updateLanguage,
  deleteLanguage,
} from "../../../src/api/services/adminLanguage.service";
import { LANGUAGE, LANGUAGE_BY_ID } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("updateLanguage", () => {
  test("PUTs to the per-language /language/{id} URL", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "l1", language: "python" } });
    await updateLanguage("l1", "python");
    expect(mockedAxios.put).toHaveBeenCalledWith(LANGUAGE_BY_ID("l1"), { language: "python" });
    expect(LANGUAGE_BY_ID("l1")).toBe(`${LANGUAGE}/l1`);
  });

  test("sends exactly { language } as the body — no other fields", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateLanguage("l1", "go");
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(body).toEqual({ language: "go" });
    expect(Object.keys(body as object)).toEqual(["language"]);
  });

  test("interpolates the id into the URL path", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateLanguage("abc-123", "rust");
    expect(mockedAxios.put).toHaveBeenCalledWith(`${LANGUAGE}/abc-123`, { language: "rust" });
  });

  test("returns the updated LanguageType body", async () => {
    const updated = { id: "l1", language: "typescript" };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateLanguage("l1", "typescript")).resolves.toBe(updated);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateLanguage("l1", "python")).rejects.toThrow("Forbidden");
  });
});

describe("deleteLanguage", () => {
  test("DELETEs the per-language /language/{id} URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteLanguage("l1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${LANGUAGE}/l1`);
  });

  test("resolves to undefined (no body to unwrap)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await expect(deleteLanguage("l1")).resolves.toBeUndefined();
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("In use"));
    await expect(deleteLanguage("l1")).rejects.toThrow("In use");
  });
});
