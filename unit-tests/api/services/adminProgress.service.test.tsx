jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchAdminStudentProgress,
  fetchAdminStudentsProgress,
} from "../../../src/api/services/adminProgress.service";
import { DSA_API_URL } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const student = (overrides: Partial<Record<string, unknown>> = {}) => ({
  userId: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  catalog: { totalProblems: 10, solvedProblems: 3, solvedProblemIds: [], byDifficulty: [], byTopic: [] },
  curriculum: { totalProblems: 5, solvedProblems: 2, solvedProblemIds: [], byTopic: [] },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchAdminStudentsProgress", () => {
  test("requests /admin/students/progress with no params", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchAdminStudentsProgress();
    expect(mockedAxios.get).toHaveBeenCalledWith(`${DSA_API_URL}/admin/students/progress`);
  });

  test("returns the response body unchanged", async () => {
    const students = [student()];
    mockedAxios.get.mockResolvedValue({ data: students });
    await expect(fetchAdminStudentsProgress()).resolves.toBe(students);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("403"));
    await expect(fetchAdminStudentsProgress()).rejects.toThrow("403");
  });
});

describe("fetchAdminStudentProgress", () => {
  test("requests /admin/students/{id}/progress", async () => {
    mockedAxios.get.mockResolvedValue({ data: student() });
    await fetchAdminStudentProgress("u1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${DSA_API_URL}/admin/students/u1/progress`);
  });

  test("returns the response body unchanged", async () => {
    const data = student();
    mockedAxios.get.mockResolvedValue({ data });
    await expect(fetchAdminStudentProgress("u1")).resolves.toBe(data);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("404"));
    await expect(fetchAdminStudentProgress("u1")).rejects.toThrow("404");
  });
});
