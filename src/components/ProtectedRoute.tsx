// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../utils/auth";
import MainLayout from "./layout/MainLayout";
import { SidebarProvider } from "./ui/sidebar";

const ProtectedRoute = () => {
  const token = getAccessToken();

  return token ? (
    <SidebarProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </SidebarProvider>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;
