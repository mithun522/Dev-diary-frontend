import {
  ADMIN_STUDENTS_PROGRESS,
  ADMIN_STUDENT_PROGRESS_BY_ID,
} from "../../constants/Api";
import type { AdminStudentProgress } from "../../data/adminProgressData";
import AxiosInstance from "../../utils/AxiosInstance";

// Every student the caller can see (a plain admin's own invited students, or every user for a
// super-admin) - roster is resolved server-side, no params.
export const fetchAdminStudentsProgress = async (): Promise<AdminStudentProgress[]> => {
  const response = await AxiosInstance.get(ADMIN_STUDENTS_PROGRESS);
  return response.data;
};

// A fresher single-student fetch, e.g. on drill-in, rather than relying on stale data from the
// list call above.
export const fetchAdminStudentProgress = async (userId: string): Promise<AdminStudentProgress> => {
  const response = await AxiosInstance.get(ADMIN_STUDENT_PROGRESS_BY_ID(userId));
  return response.data;
};
