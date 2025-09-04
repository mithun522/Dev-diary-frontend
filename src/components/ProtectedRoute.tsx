import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { SidebarProvider } from "./ui/sidebar";
import { getAccessToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = () => {
  const token = getAccessToken();

  if (!token) return <Navigate to="/auth/login" replace />;

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch {
    return <Navigate to="/auth/login" replace />;
  }

  const { exp } = decoded;
  if (!exp || Date.now() >= exp * 1000) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <SidebarProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </SidebarProvider>
  );
};

export default ProtectedRoute;
