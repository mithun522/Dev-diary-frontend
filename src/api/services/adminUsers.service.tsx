import { ADMIN_USERS, ADMIN_USER_ROLE } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import type { AdminUser, AdminUserPage, UserRole } from "../../data/adminData";

export const fetchAdminUsers = async (
  search: string = "",
  pageParam: number
): Promise<AdminUserPage> => {
  const params = new URLSearchParams();

  if (search) params.append("searchString", search);
  if (pageParam) params.append("pageNumber", String(pageParam));

  const queryString = params.toString();
  const url = queryString ? `${ADMIN_USERS}?${queryString}` : ADMIN_USERS;

  const response = await AxiosInstance.get(url);
  return response.data;
};

export const updateUserRole = async (
  id: string,
  role: UserRole
): Promise<AdminUser> => {
  const response = await AxiosInstance.put(ADMIN_USER_ROLE(id), { role });
  return response.data;
};
