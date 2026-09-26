import {
  ADMIN_COHORTS,
  ADMIN_COHORT_BY_ID,
  ADMIN_COHORT_STUDENTS,
  ADMIN_COHORT_STUDENT_BY_ID,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type {
  AddStudentsToCohortResponse,
  Cohort,
  CohortStudent,
} from "../../data/cohortData";

export const createCohort = async (name: string): Promise<Cohort> => {
  const response = await AxiosInstance.post(ADMIN_COHORTS, { name });
  return response.data;
};

// Every cohort the calling admin owns, with each cohort's current student count.
export const listCohorts = async (): Promise<Cohort[]> => {
  const response = await AxiosInstance.get(ADMIN_COHORTS);
  return response.data;
};

export const renameCohort = async (id: string, name: string): Promise<Cohort> => {
  const response = await AxiosInstance.put(ADMIN_COHORT_BY_ID(id), { name });
  return response.data;
};

// Deletes the cohort itself, not its students — they're unassigned (cohort_id set to null), not
// removed from the admin's roster.
export const deleteCohort = async (id: string): Promise<{ message: string }> => {
  const response = await AxiosInstance.delete(ADMIN_COHORT_BY_ID(id));
  return response.data;
};

export const listCohortStudents = async (cohortId: string): Promise<CohortStudent[]> => {
  const response = await AxiosInstance.get(ADMIN_COHORT_STUDENTS(cohortId));
  return response.data;
};

// Bulk-adds (or moves, if already in a different cohort of this same admin's) the given students
// into this cohort. Any id that isn't one of the caller's own invited students comes back in
// `results` as "notFound" rather than failing the whole request.
export const addStudentsToCohort = async (
  cohortId: string,
  studentIds: string[]
): Promise<AddStudentsToCohortResponse> => {
  const response = await AxiosInstance.post(ADMIN_COHORT_STUDENTS(cohortId), { studentIds });
  return response.data;
};

export const removeStudentFromCohort = async (
  cohortId: string,
  studentId: string
): Promise<{ message: string }> => {
  const response = await AxiosInstance.delete(
    ADMIN_COHORT_STUDENT_BY_ID(cohortId, studentId)
  );
  return response.data;
};
