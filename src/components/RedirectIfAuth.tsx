// utils/RedirectIfAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, isTokenExpired } from "../utils/auth";

const RedirectIfAuth = () => {
  const token = getAccessToken();

  if (token && !isTokenExpired(token)) {
    return <Navigate to="/dsa" replace />;
  }

  return <Outlet />;
};

export default RedirectIfAuth;
