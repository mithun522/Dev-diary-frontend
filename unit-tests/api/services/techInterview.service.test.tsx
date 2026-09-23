jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  getTechInterviewByLanguage,
  searchTechInterview,
} from "../../../src/api/services/techInterview.service";
import { TECHNICAL_INTERVIEW } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getTechInterviewByLanguage", () => {
  test("requests /techinterview?language={language}&page={pageNumber}", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { techInterview: [], techInterviewTotalLength: 0 },
    });
    await getTechInterviewByLanguage("javascript", 1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECHNICAL_INTERVIEW}?language=javascript&page=1`
    );
  });

  test("always includes both params, even page 0 (no falsy-omission like catalog.service)", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { techInterview: [], techInterviewTotalLength: 0 },
    });
    await getTechInterviewByLanguage("python", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECHNICAL_INTERVIEW}?language=python&page=0`
    );
  });

  test("BUG: does not URL-encode the language param — special characters pass through raw", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { techInterview: [], techInterviewTotalLength: 0 },
    });
    await getTechInterviewByLanguage("c++ & c#", 2);
    // Unlike catalog.service/adminUsers.service (which use URLSearchParams and encode), this
    // service builds the query string via raw template-literal interpolation, so "&"/"#"/" "
    // land in the URL unescaped and would corrupt the query string on a real request.
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECHNICAL_INTERVIEW}?language=c++ & c#&page=2`
    );
  });

  test("unwraps and renames response fields into { techInterview, techInterviewTotalLength }", async () => {
    const items = [{ id: "t1" }, { id: "t2" }];
    mockedAxios.get.mockResolvedValue({
      data: { techInterview: items, techInterviewTotalLength: 2 },
    });
    await expect(getTechInterviewByLanguage("javascript", 1)).resolves.toEqual({
      techInterview: items,
      techInterviewTotalLength: 2,
    });
  });

  test("does not pass through unrelated response fields", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { techInterview: [], techInterviewTotalLength: 0, extra: "ignored" },
    });
    const result = await getTechInterviewByLanguage("javascript", 1);
    expect(Object.keys(result)).toEqual(["techInterview", "techInterviewTotalLength"]);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(getTechInterviewByLanguage("javascript", 1)).rejects.toThrow(
      "Network Error"
    );
  });
});

describe("searchTechInterview", () => {
  test("requests /techinterview/search?search={query}&language={language}", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await searchTechInterview("closures", "javascript");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECHNICAL_INTERVIEW}/search?search=closures&language=javascript`
    );
  });

  test("BUG: does not URL-encode the search query — special characters pass through raw", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await searchTechInterview("a&b=c d", "javascript");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECHNICAL_INTERVIEW}/search?search=a&b=c d&language=javascript`
    );
  });

  test("returns the raw response body unchanged (no unwrapping)", async () => {
    const body = { results: [{ id: "q1" }] };
    mockedAxios.get.mockResolvedValue({ data: body });
    await expect(searchTechInterview("closures", "javascript")).resolves.toBe(body);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(searchTechInterview("closures", "javascript")).rejects.toThrow(
      "Network Error"
    );
  });
});
