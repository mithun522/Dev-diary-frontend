import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "./ui/sidebar";
import AdminLayout from "./layout/AdminLayout";
import { getAccessToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

// Mirrors AdminRoute's token/exp check, but gates on the separate isSuperAdmin claim instead of
// role — a super admin's JWT still carries role:"admin" (see auth-service's seedSuperAdmin.js),
// so this can't just reuse AdminRoute's role check.
const SuperAdminRoute = () => {
  const token = getAccessToken();

  if (!token) return <Navigate to="/auth/login" replace />;

  let decoded;
  try {
    decoded = jwtDecode<{ exp?: number; isSuperAdmin?: boolean }>(token);
  } catch {
    return <Navigate to="/auth/login" replace />;
  }

  const { exp, isSuperAdmin } = decoded;
  if (!exp || Date.now() >= exp * 1000) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dsa" replace />;
  }

  return (
    <SidebarProvider>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </SidebarProvider>
  );
};

export default SuperAdminRoute;
