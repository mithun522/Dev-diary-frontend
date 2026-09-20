import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./providers/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import GlobalLoadingBar from "./components/GlobalLoadingBar";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import { ToastContainer } from "react-toastify";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyOTPPage from "./pages/auth/VerifyOtp";
import DSAPage from "./pages/dsa/DSAPage";
import SolveProblemPage from "./pages/dsa/practice/SolveProblemPage";
import CurriculumSolveProblemPage from "./pages/dsa/curriculum/CurriculumSolveProblemPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewPage from "./pages/interview/InterviewPage";
import LiveInterviewPage from "./pages/interview/LiveInterviewPage";
import KnowledgePage from "./pages/knowledge/KnowledgePage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import MyProfilePage from "./pages/my-profile/MyProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TechnicalInterviewPage from "./pages/technical-interview/Index";
import CatalogBrowsePage from "./pages/technical-interview/catalog/CatalogBrowsePage";
import CatalogStackPage from "./pages/technical-interview/catalog/CatalogStackPage";
import CatalogSearchPage from "./pages/technical-interview/catalog/CatalogSearchPage";
import QuestionBankPage from "./pages/question-bank/QuestionBankPage";
import RedirectIfAuth from "./components/RedirectIfAuth";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import AcceptInvitePage from "./pages/auth/AcceptInvitePage";
import InviteAdminsPage from "./pages/superadmin/InviteAdminsPage";
import InviteStudentsPage from "./pages/admin/students/InviteStudentsPage";
import AdminUsersPage from "./pages/admin/users/AdminUsersPage";
import AdminCatalogPage from "./pages/admin/dsa/AdminCatalogPage";
import AdminCurriculumTopicsPage from "./pages/admin/dsa/AdminCurriculumTopicsPage";
import AdminCurriculumProblemsPage from "./pages/admin/dsa/AdminCurriculumProblemsPage";
import AdminLanguagesPage from "./pages/admin/dsa/AdminLanguagesPage";
import AdminBlogsPage from "./pages/admin/knowledge/AdminBlogsPage";
import AdminMaterialsPage from "./pages/admin/questionBank/AdminMaterialsPage";
import AdminCasesPage from "./pages/admin/systemDesign/AdminCasesPage";
import AdminPatternsPage from "./pages/admin/systemDesign/AdminPatternsPage";
import AdminMockInterviewsPage from "./pages/admin/interviewSimulator/AdminMockInterviewsPage";
import AdminCompanyProblemsPage from "./pages/admin/interviewSimulator/AdminCompanyProblemsPage";
import AdminBehavioralQuestionsPage from "./pages/admin/interviewSimulator/AdminBehavioralQuestionsPage";
import AdminInterviewSessionsPage from "./pages/admin/interviewSimulator/AdminInterviewSessionsPage";
import AdminInterviewSessionDetailPage from "./pages/admin/interviewSimulator/AdminInterviewSessionDetailPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <BrowserRouter>
            <GlobalLoadingBar />
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
              {/* Path is fixed by auth-service's inviteService.js::buildActivationLink, which
                  hardcodes `${FRONTEND_BASE_URL}/activate-account?token=...` in every invite
                  email — not a route naming choice made here. */}
              <Route path="/activate-account" element={<AcceptInvitePage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dsa" element={<DSAPage />} />
                <Route path="/dsa/practice/:id" element={<SolveProblemPage />} />
                <Route
                  path="/dsa/curriculum/:problemId"
                  element={<CurriculumSolveProblemPage />}
                />
                <Route path="/interview" element={<InterviewPage />} />
                <Route
                  path="/interview/live/:interviewId"
                  element={<LiveInterviewPage />}
                />
                {/* System Design is gated for now — not ready to show to users yet, per current
                    product decision. Its page component and admin CRUD stay fully intact in the
                    codebase for when it is; a stray link here just falls through to the
                    catch-all "*" route below. */}
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/technical-interview"
                  element={<TechnicalInterviewPage />}
                />
                {/* Dedicated, shareable catalog pages — the in-tab browsing UI in
                    TechnicalInterviewPage's Question Bank tab just links out to these. */}
                <Route
                  path="/technical-interview/catalog"
                  element={<CatalogBrowsePage />}
                />
                <Route
                  path="/technical-interview/catalog/search"
                  element={<CatalogSearchPage />}
                />
                <Route
                  path="/technical-interview/catalog/:stack"
                  element={<CatalogStackPage />}
                />
                <Route path="/question-bank" element={<QuestionBankPage />} />
              </Route>

              {/* Admin routes — a plain org admin's whole toolkit for now: invite students,
                  monitor/manage users, review interview sessions. See AdminLayout.tsx's
                  BASE_NAV_ITEMS/EXTENDED_NAV_ITEMS comment for why the rest lives under
                  SuperAdminRoute below instead of here, fully built but not yet exposed. */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route
                  path="/admin/students/invite"
                  element={<InviteStudentsPage />}
                />
                <Route
                  path="/admin/interview-sessions"
                  element={<AdminInterviewSessionsPage />}
                />
                <Route
                  path="/admin/interview-sessions/:id"
                  element={<AdminInterviewSessionDetailPage />}
                />
              </Route>

              {/* Super-admin routes */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/super-admin/invites" element={<InviteAdminsPage />} />

                {/* Dormant for a plain org admin — fully implemented, just not exposed yet (per
                    current product decision), so reachable only via the super admin's nav for
                    now until each of these gets its own real access story. */}
                <Route path="/admin/dsa/catalog" element={<AdminCatalogPage />} />
                <Route
                  path="/admin/dsa/curriculum"
                  element={<AdminCurriculumTopicsPage />}
                />
                <Route
                  path="/admin/dsa/curriculum/:topicId"
                  element={<AdminCurriculumProblemsPage />}
                />
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
