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
import SolveProblemPage from "./pages/dsa/practice/SolveProblemPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewPage from "./pages/interview/InterviewPage";
import LiveInterviewPage from "./pages/interview/LiveInterviewPage";
import SystemDesignPage from "./pages/system-design/SystemDesign";
import KnowledgePage from "./pages/knowledge/KnowledgePage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import MyProfilePage from "./pages/my-profile/MyProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TechnicalInterviewPage from "./pages/technical-interview/Index";
import QuestionBankPage from "./pages/question-bank/QuestionBankPage";
import RedirectIfAuth from "./components/RedirectIfAuth";
import AdminRoute from "./components/AdminRoute";
import AdminUsersPage from "./pages/admin/users/AdminUsersPage";
import AdminCatalogPage from "./pages/admin/dsa/AdminCatalogPage";
import AdminLanguagesPage from "./pages/admin/dsa/AdminLanguagesPage";
import AdminBlogsPage from "./pages/admin/knowledge/AdminBlogsPage";
import AdminMaterialsPage from "./pages/admin/questionBank/AdminMaterialsPage";
import AdminCasesPage from "./pages/admin/systemDesign/AdminCasesPage";
import AdminPatternsPage from "./pages/admin/systemDesign/AdminPatternsPage";
import AdminMockInterviewsPage from "./pages/admin/interviewSimulator/AdminMockInterviewsPage";
import AdminCompanyProblemsPage from "./pages/admin/interviewSimulator/AdminCompanyProblemsPage";
import AdminBehavioralQuestionsPage from "./pages/admin/interviewSimulator/AdminBehavioralQuestionsPage";

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
                <Route path="/dsa/practice/:id" element={<SolveProblemPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route
                  path="/interview/live/:interviewId"
                  element={<LiveInterviewPage />}
                />
                <Route path="/system-design" element={<SystemDesignPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/technical-interview"
                  element={<TechnicalInterviewPage />}
                />
                <Route path="/question-bank" element={<QuestionBankPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/dsa/catalog" element={<AdminCatalogPage />} />
                <Route path="/admin/dsa/languages" element={<AdminLanguagesPage />} />
                <Route path="/admin/knowledge/blogs" element={<AdminBlogsPage />} />
                <Route
                  path="/admin/question-bank/materials"
                  element={<AdminMaterialsPage />}
                />
                <Route path="/admin/system-design/cases" element={<AdminCasesPage />} />
                <Route
                  path="/admin/system-design/patterns"
                  element={<AdminPatternsPage />}
                />
                <Route
                  path="/admin/interview-simulator/mock-interviews"
                  element={<AdminMockInterviewsPage />}
                />
                <Route
                  path="/admin/interview-simulator/company-problems"
                  element={<AdminCompanyProblemsPage />}
                />
                <Route
                  path="/admin/interview-simulator/behavioral-questions"
                  element={<AdminBehavioralQuestionsPage />}
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
