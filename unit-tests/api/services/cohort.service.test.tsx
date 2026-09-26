jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  addStudentsToCohort,
  createCohort,
  deleteCohort,
  listCohortStudents,
  listCohorts,
  removeStudentFromCohort,
  renameCohort,
} from "../../../src/api/services/cohort.service";
import { AUTH_API_URL } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const COHORTS = `${AUTH_API_URL}/admin/cohorts`;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createCohort", () => {
  test("POSTs { name } to /admin/cohorts", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "c1", name: "Batch A", studentCount: 0, createdAt: "x" } });
    await createCohort("Batch A");
    expect(mockedAxios.post).toHaveBeenCalledWith(COHORTS, { name: "Batch A" });
  });

  test("returns the response body unchanged", async () => {
    const cohort = { id: "c1", name: "Batch A", studentCount: 0, createdAt: "x" };
    mockedAxios.post.mockResolvedValue({ data: cohort });
    await expect(createCohort("Batch A")).resolves.toBe(cohort);
  });
});

describe("listCohorts", () => {
  test("requests /admin/cohorts", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await listCohorts();
    expect(mockedAxios.get).toHaveBeenCalledWith(COHORTS);
  });

  test("returns the response body unchanged", async () => {
    const cohorts = [{ id: "c1", name: "Batch A", studentCount: 3, createdAt: "x" }];
    mockedAxios.get.mockResolvedValue({ data: cohorts });
    await expect(listCohorts()).resolves.toBe(cohorts);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("403"));
    await expect(listCohorts()).rejects.toThrow("403");
  });
});

describe("renameCohort", () => {
  test("PUTs { name } to /admin/cohorts/{id}", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "c1", name: "New Name", createdAt: "x" } });
    await renameCohort("c1", "New Name");
    expect(mockedAxios.put).toHaveBeenCalledWith(`${COHORTS}/c1`, { name: "New Name" });
  });
});

describe("deleteCohort", () => {
  test("DELETEs /admin/cohorts/{id}", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "Cohort deleted" } });
    await deleteCohort("c1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${COHORTS}/c1`);
  });
});

describe("listCohortStudents", () => {
  test("requests /admin/cohorts/{id}/students", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await listCohortStudents("c1");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${COHORTS}/c1/students`);
  });

  test("returns the response body unchanged", async () => {
    const students = [
      { id: "u1", email: "a@example.com", firstName: "Ada", lastName: "L", status: "active" },
    ];
    mockedAxios.get.mockResolvedValue({ data: students });
    await expect(listCohortStudents("c1")).resolves.toBe(students);
  });
});

describe("addStudentsToCohort", () => {
  test("POSTs { studentIds } to /admin/cohorts/{id}/students", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "Added 1 of 1 students", results: [] } });
    await addStudentsToCohort("c1", ["u1", "u2"]);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${COHORTS}/c1/students`, {
      studentIds: ["u1", "u2"],
    });
  });

  test("returns the response body unchanged", async () => {
    const response = {
      message: "Added 1 of 2 students",
      results: [
        { studentId: "u1", status: "added" },
        { studentId: "u2", status: "notFound" },
      ],
    };
    mockedAxios.post.mockResolvedValue({ data: response });
    await expect(addStudentsToCohort("c1", ["u1", "u2"])).resolves.toBe(response);
  });
});

describe("removeStudentFromCohort", () => {
  test("DELETEs /admin/cohorts/{id}/students/{studentId}", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "Student removed from cohort" } });
    await removeStudentFromCohort("c1", "u1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${COHORTS}/c1/students/u1`);
  });
});
