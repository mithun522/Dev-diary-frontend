jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchDsaByUser,
  fetchDsaProgress,
} from "../../../src/api/services/dsa.service";
import { DSA_BY_USER, DSA_BY_PROGRESS } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const emptyPage = { data: { dsa: [], totalLength: 0 } };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchDsaByUser", () => {
  test("requests the bare /dsa/user URL when no filters and no page are given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(DSA_BY_USER);
  });

  test("appends searchString when a search term is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("binary search", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${DSA_BY_USER}?searchString=binary+search`
    );
  });

  test("appends difficulty when one is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("", "EASY", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${DSA_BY_USER}?difficulty=EASY`);
  });

  test("passes the difficulty string through verbatim, without normalising case", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("", "easy", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${DSA_BY_USER}?difficulty=easy`);
  });

  test("appends pageNumber when a truthy page is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("", "", 4);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${DSA_BY_USER}?pageNumber=4`);
  });

  test("omits pageNumber for page 0 (falsy), so page 1 is implicit", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(DSA_BY_USER);
  });

  test("combines all three params in a single query string, in insertion order", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("dp", "HARD", 2);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${DSA_BY_USER}?searchString=dp&difficulty=HARD&pageNumber=2`
    );
  });

  test("URL-encodes special characters in the search term", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("a&b=c d", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${DSA_BY_USER}?searchString=a%26b%3Dc+d`
    );
  });

  test("encodes a '+' in the search term rather than passing it through as a space", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser("C++", "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${DSA_BY_USER}?searchString=C%2B%2B`
    );
  });

  test("defaults search to an empty string when the argument is omitted", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchDsaByUser(undefined, "", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(DSA_BY_USER);
  });

  test("returns response.data (the { dsa, totalLength } page), not the whole response", async () => {
    const page = { dsa: [{ id: "d1" }], totalLength: 1 };
    mockedAxios.get.mockResolvedValue({ data: page });
    await expect(fetchDsaByUser("", "", 1)).resolves.toBe(page);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchDsaByUser("", "", 1)).rejects.toThrow("Network Error");
  });
});

describe("fetchDsaProgress", () => {
  test("requests /dsa/progress/user with no query params", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchDsaProgress();
    expect(mockedAxios.get).toHaveBeenCalledWith(DSA_BY_PROGRESS);
  });

  test("returns the FULL axios response, not response.data (unlike every sibling service fn)", async () => {
    const response = { data: [{ date: "2024-01-01", problemsSolved: 2 }], status: 200 };
    mockedAxios.get.mockResolvedValue(response);
    await expect(fetchDsaProgress()).resolves.toBe(response);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("500"));
    await expect(fetchDsaProgress()).rejects.toThrow("500");
  });
});
