// Shared types for the Admin Panel's user-management slice
// (`GET /admin/users`, `PUT /admin/users/{id}/role` on user-service).

export type UserRole = "user" | "admin";

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
};

export type AdminUserPage = {
  users: AdminUser[];
  totalLength: number;
};
