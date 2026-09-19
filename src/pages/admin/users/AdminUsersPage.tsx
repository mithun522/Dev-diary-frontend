import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useDebounce } from "../../../api/hooks/use-debounce";
import {
  useFetchAdminUsers,
  useUpdateUserRole,
} from "../../../api/hooks/useAdminUsers";
import type { AdminUser, UserRole } from "../../../data/adminData";
import { formatDate } from "../../../utils/formatDate";
import { loggedInUserId } from "../../../utils/auth";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const AdminUsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const currentUserId = loggedInUserId();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchAdminUsers({ search: debouncedSearch });

  const updateRoleMutation = useUpdateUserRole();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const users = data?.pages?.flatMap((page) => page.users) ?? [];

  const handleRoleChange = (user: AdminUser, role: UserRole) => {
    if (role === user.role) return;

    setPendingUserId(user.id);
    updateRoleMutation.mutate(
      { id: user.id, role },
      {
        onSuccess: () => {
          toast.success(
            `${user.firstName} ${user.lastName} is now ${
              role === "admin" ? "an admin" : "a regular user"
            }.`
          );
        },
        onError: (err) => {
          toast.error(errorMessage(err, "Failed to update user role"));
          logger.error("Error updating user role:", err);
        },
        onSettled: () => {
          setPendingUserId(null);
        },
      }
    );
  };

  if (error) return <ErrorPage message="Failed to fetch users" />;

  return (
    <div className="space-y-6" data-cy="admin-users-page">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Search users and manage their roles.
        </p>
      </div>

      <div className="flex-1">
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
          data-cy="admin-users-search"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-users-table">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isPending =
                    updateRoleMutation.isPending && pendingUserId === user.id;

                  return (
                    <TableRow key={user.id} data-cy="admin-users-row">
                      <TableCell
                        className="font-medium"
                        data-cy="admin-users-row-email"
                      >
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                          data-cy="admin-users-row-role-badge"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? formatDate(user.createdAt) : "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleRoleChange(user, value as UserRole)
                          }
                          disabled={isSelf || isPending}
                        >
                          <SelectTrigger
                            className="w-[130px]"
                            data-cy="admin-users-role-select-trigger"
                            title={
                              isSelf
                                ? "You cannot change your own role"
                                : undefined
                            }
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent data-cy="admin-users-role-select-content">
                            <SelectGroup>
                              <SelectItem value="user">user</SelectItem>
                              <SelectItem value="admin">admin</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {hasNextPage && (
            <div className="flex justify-center mt-4 mb-4">
              <Button
                variant="outlinePrimary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                data-cy="admin-users-load-more"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
