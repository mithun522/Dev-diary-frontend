import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import { ToastContainer } from "react-toastify";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyOTPPage from "./pages/auth/VerifyOtp";
import DSAPage from "./pages/dsa/DSAPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewPage from "./pages/interview/InterviewPage";
import SystemDesignPage from "./pages/system-design/SystemDesign";
import KnowledgePage from "./pages/knowledge/KnowledgePage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import MyProfilePage from "./pages/MyProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TechnicalInterviewPage from "./pages/technical-interview/Index";
import RedirectIfAuth from "./components/RedirectIfAuth";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <BrowserRouter>
            <ToastContainer />
            <Routes>
              <Route element={<RedirectIfAuth />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/signup" element={<SignupPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordPage />}
                />
              </Route>

              <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />
              <Route
                path="/auth/reset-password"
                element={<ResetPasswordPage />}
              />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dsa" element={<DSAPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/system-design" element={<SystemDesignPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/technical-interview"
                  element={<TechnicalInterviewPage />}
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
