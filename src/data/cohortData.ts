// A named group of an admin's own invited students (a batch/section), owned by exactly one
// admin - see auth-service's openapi.yaml /admin/cohorts.
export type Cohort = {
  id: string;
  name: string;
  studentCount: number;
  createdAt: string;
};

// One student currently assigned to a cohort. `status` reflects the underlying invite/account
// state - "pending" students haven't accepted their invite yet but are still a real row (and a
// real id) in auth.users, so they can be assigned to a cohort before they ever log in.
export type CohortStudent = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "pending" | "active";
};

export type AddStudentsToCohortResult = {
  studentId: string;
  // "notFound" covers both a bad id and an id that isn't one of the caller's own invited
  // students - the backend deliberately doesn't distinguish those two cases in the response.
  status: "added" | "notFound";
};

export type AddStudentsToCohortResponse = {
  message: string;
  results: AddStudentsToCohortResult[];
};
