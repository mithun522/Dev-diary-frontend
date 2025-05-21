import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// import Layout from '../components/layout/Layout';
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import LandingPage from "../pages/Landing";
// import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
// import VerifyOTPPage from '../pages/auth/VerifyOTPPage';
// import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
// import DashboardPage from '../pages/dashboard/DashboardPage';
// import DSATrackerPage from '../pages/dsa/DSATrackerPage';
// import InterviewPrepPage from '../pages/interview/InterviewPrepPage';
// import SystemDesignPage from '../pages/system-design/SystemDesignPage';
// import KnowledgeBasePage from '../pages/knowledge/KnowledgeBasePage';
// import AnalyticsPage from '../pages/analytics/AnalyticsPage';
// import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          !isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />
        }
      />
      <Route
        path="/signup"
        element={
          !isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" />
        }
      />
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} /> */}

      {/* <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dsa-tracker" element={<DSATrackerPage />} />
        <Route path="interview-prep" element={<InterviewPrepPage />} />
        <Route path="system-design" element={<SystemDesignPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
};

export default AppRoutes;
