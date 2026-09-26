import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStudentsToCohort,
  createCohort,
  deleteCohort,
  listCohortStudents,
  listCohorts,
  removeStudentFromCohort,
  renameCohort,
} from "../services/cohort.service";

export const useCohorts = () => {
  return useQuery({
    queryKey: ["cohorts"],
    queryFn: listCohorts,
  });
};

export const useCohortStudents = (cohortId?: string) => {
  return useQuery({
    queryKey: ["cohort-students", cohortId],
    queryFn: () => listCohortStudents(cohortId as string),
    enabled: !!cohortId,
  });
};

export const useCreateCohort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCohort(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cohorts"] }),
  });
};

export const useRenameCohort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCohort(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cohorts"] }),
  });
};

export const useDeleteCohort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCohort(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cohorts"] }),
  });
};

// Invalidates both this cohort's own student list and the cohorts list (a student moving in
// changes this cohort's studentCount, and moving OUT of a different cohort of the same admin's
// changes that one's count too — but we don't know that other cohort's id here, so the blanket
// ["cohorts"] invalidation covers it instead of trying to track it precisely).
export const useAddStudentsToCohort = (cohortId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentIds: string[]) => addStudentsToCohort(cohortId, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-students", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    },
  });
};

export const useRemoveStudentFromCohort = (cohortId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => removeStudentFromCohort(cohortId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cohort-students", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohorts"] });
    },
  });
};
