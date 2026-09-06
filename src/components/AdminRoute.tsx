import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "./ui/sidebar";
import AdminLayout from "./layout/AdminLayout";
import { getAccessToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

// Mirrors ProtectedRoute's token/exp check, and additionally requires the "admin" role claim
// the backend already signs into every JWT (see auth-service's authService.js::login).
const AdminRoute = () => {
  const token = getAccessToken();

  if (!token) return <Navigate to="/auth/login" replace />;

  let decoded;
  try {
    decoded = jwtDecode<{ exp?: number; role?: string }>(token);
  } catch {
    return <Navigate to="/auth/login" replace />;
  }

  const { exp, role } = decoded;
  if (!exp || Date.now() >= exp * 1000) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role !== "admin") {
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

export default AdminRoute;
