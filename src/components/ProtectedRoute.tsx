import { Navigate, Outlet } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { SidebarProvider } from "./ui/sidebar";
import { getAccessToken } from "../utils/auth";

const ProtectedRoute = () => {
  const token = getAccessToken();

  if (!token) {
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
