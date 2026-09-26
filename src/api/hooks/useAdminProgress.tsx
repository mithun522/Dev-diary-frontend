import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminStudentProgress,
  fetchAdminStudentsProgress,
} from "../services/adminProgress.service";

// Powers the admin Student Progress page's roster table - one call returns everyone the caller is
// allowed to see (scoped server-side), so there's no client-side pagination param to thread here.
export const useAdminStudentsProgress = () => {
  return useQuery({
    queryKey: ["admin-students-progress"],
    queryFn: fetchAdminStudentsProgress,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// A fresher single-student fetch for the drill-down detail view.
export const useAdminStudentProgress = (userId?: string) => {
  return useQuery({
    queryKey: ["admin-student-progress", userId],
    queryFn: () => fetchAdminStudentProgress(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
