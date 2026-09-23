jest.mock("../../../src/utils/AxiosInstance");
jest.mock("../../../src/utils/auth", () => ({ loggedInUserId: jest.fn() }));

import AxiosInstance from "../../../src/utils/AxiosInstance";
import { loggedInUserId } from "../../../src/utils/auth";
import { fetchUserProfile } from "../../../src/api/services/user-profile.service";
import { SINGLE_USER } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;
const mockedLoggedInUserId = loggedInUserId as jest.MockedFunction<typeof loggedInUserId>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchUserProfile", () => {
  test("requests /user/{id} using the currently logged-in user's id", async () => {
    mockedLoggedInUserId.mockReturnValue("u1");
    mockedAxios.get.mockResolvedValue({ data: { firstName: "A" } });
    await fetchUserProfile();
    expect(mockedAxios.get).toHaveBeenCalledWith(`${SINGLE_USER}/u1`);
  });

  test("interpolates a different user id from loggedInUserId into the URL", async () => {
    mockedLoggedInUserId.mockReturnValue("abc-123");
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchUserProfile();
    expect(mockedAxios.get).toHaveBeenCalledWith(`${SINGLE_USER}/abc-123`);
  });

  // loggedInUserId() returns `null` when there's no valid token (see utils/auth.ts) — the service
  // has no guard for that, so it still fires a request, now to /user/null.
  test("requests /user/null when loggedInUserId returns null rather than short-circuiting", async () => {
    mockedLoggedInUserId.mockReturnValue(null);
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchUserProfile();
    expect(mockedAxios.get).toHaveBeenCalledWith(`${SINGLE_USER}/null`);
  });

  test("returns the response body unchanged (UserProfile passthrough)", async () => {
    mockedLoggedInUserId.mockReturnValue("u1");
    const profile = {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      professionalDetails: { currentRole: "Engineer" },
      socialLinks: {},
    };
    mockedAxios.get.mockResolvedValue({ data: profile });
    await expect(fetchUserProfile()).resolves.toBe(profile);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedLoggedInUserId.mockReturnValue("u1");
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchUserProfile()).rejects.toThrow("Network Error");
  });
});
