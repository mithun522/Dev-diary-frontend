import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "./layout/MainLayout";
import { SidebarProvider } from "./ui/sidebar";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div>
      <SidebarProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </SidebarProvider>
    </div>
  );
};

export default ProtectedRoute;
