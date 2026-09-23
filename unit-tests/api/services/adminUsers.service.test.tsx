jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchAdminUsers,
  updateUserRole,
} from "../../../src/api/services/adminUsers.service";
import { ADMIN_USERS, USER_API_URL } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const emptyPage = { data: { users: [], totalLength: 0 } };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("admin-scoped endpoint paths", () => {
  test("ADMIN_USERS lives under user-service's /admin namespace", () => {
    expect(ADMIN_USERS).toBe(`${USER_API_URL}/admin/users`);
  });
});

describe("fetchAdminUsers", () => {
  test("requests the bare /admin/users URL when neither search nor page is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_USERS);
  });

  test("appends searchString when a search term is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("jane", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${ADMIN_USERS}?searchString=jane`);
  });

  test("appends pageNumber when a truthy page is given", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("", 2);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${ADMIN_USERS}?pageNumber=2`);
  });

  test("omits pageNumber for page 0 (falsy), so page 1 is implicit", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("jane", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${ADMIN_USERS}?searchString=jane`);
  });

  test("combines search and page in one query string, search first", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("jane", 2);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_USERS}?searchString=jane&pageNumber=2`
    );
  });

  test("URL-encodes an email-shaped search term", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers("a@b.com test&x", 0);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${ADMIN_USERS}?searchString=a%40b.com+test%26x`
    );
  });

  test("defaults the search term to empty when omitted entirely", async () => {
    mockedAxios.get.mockResolvedValue(emptyPage);
    await fetchAdminUsers(undefined, 1);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${ADMIN_USERS}?pageNumber=1`);
  });

  test("returns the AdminUserPage body unchanged", async () => {
    const page = {
      users: [
        {
          id: "u1",
          email: "a@b.com",
          firstName: "A",
          lastName: "B",
          role: "user" as const,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ],
      totalLength: 1,
    };
    mockedAxios.get.mockResolvedValue({ data: page });
    await expect(fetchAdminUsers("", 1)).resolves.toBe(page);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Request failed with status code 403"));
    await expect(fetchAdminUsers("", 1)).rejects.toThrow(
      "Request failed with status code 403"
    );
  });
});

describe("updateUserRole", () => {
  test("PUTs to the per-user /role sub-resource, not the collection", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateUserRole("u1", "admin");
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${ADMIN_USERS}/u1/role`,
      expect.anything()
    );
  });

  test("sends exactly { role } as the body — no other fields", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateUserRole("u1", "admin");
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(body).toEqual({ role: "admin" });
    expect(Object.keys(body as object)).toEqual(["role"]);
  });

  test.each(["user", "admin"] as const)("threads the %s role through", async (role) => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateUserRole("u1", role);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${ADMIN_USERS}/u1/role`, { role });
  });

  test("interpolates the id into the URL path", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateUserRole("abc-123-def", "user");
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${ADMIN_USERS}/abc-123-def/role`,
      { role: "user" }
    );
  });

  test("returns the updated AdminUser body", async () => {
    const updated = {
      id: "u1",
      email: "a@b.com",
      firstName: "A",
      lastName: "B",
      role: "admin" as const,
      createdAt: "2024-01-01T00:00:00Z",
    };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateUserRole("u1", "admin")).resolves.toBe(updated);
  });

  test("propagates a 403 rejection for a non-admin caller", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Forbidden"));
    await expect(updateUserRole("u1", "admin")).rejects.toThrow("Forbidden");
  });
});
