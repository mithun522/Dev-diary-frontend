import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  updateUserRole,
} from "../services/adminUsers.service";
import type { AdminUser, AdminUserPage, UserRole } from "../../data/adminData";

interface FetchAdminUsersProps {
  search: string;
}

export const useFetchAdminUsers = ({ search }: FetchAdminUsersProps) => {
  return useInfiniteQuery<AdminUserPage, Error>({
    queryKey: ["admin-users", search ?? ""],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchAdminUsers(search, Number(pageParam));
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.users).length;

      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Updates the cached list in place (rather than a blanket invalidate) so a role change reflects
// immediately without a refetch/flash, mirroring useFetchDsaProblemByUser's delete-cache pattern.
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: (updatedUser: AdminUser) => {
      queryClient.setQueriesData(
        { queryKey: ["admin-users"], exact: false },
        (oldData: unknown) => {
          const infiniteData = oldData as
            | { pages: AdminUserPage[]; pageParams: unknown[] }
            | undefined;

          if (!infiniteData?.pages) return oldData;

          return {
            ...infiniteData,
            pages: infiniteData.pages.map((page) => ({
              ...page,
              users: page.users.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
              ),
            })),
          };
        }
      );
    },
  });
};
