import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  useSidebar,
} from "../../components/ui/sidebar";
import {
  ArrowLeft,
  Archive,
  Building,
  Building2,
  Code,
  GraduationCap,
  HelpCircle,
  Languages,
  LogOut,
  Layers,
  MonitorPlay,
  Newspaper,
  ShieldCheck,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import Button from "../ui/button";
import LogoutModal from "../LogoutModal";
import { isSuperAdmin } from "../../utils/auth";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

// A plain org admin's whole toolkit for now: invite students, monitor/manage users, review
// interview sessions. Everything else below (EXTENDED_NAV_ITEMS) is fully built and functional,
// just not exposed to a plain admin yet — routed behind SuperAdminRoute in App.tsx until each
// piece gets its own real access story, per the current product decision to keep the features
// dormant rather than delete them.
const BASE_NAV_ITEMS = [
  { to: "/admin/users", label: "Users", icon: Users, cy: "admin" },
  {
    to: "/admin/students/invite",
    label: "Invite Students",
    icon: UserPlus,
    cy: "admin-invite-students",
  },
  {
    to: "/admin/interview-sessions",
    label: "Interview Sessions",
    icon: MonitorPlay,
    cy: "admin-interview-sessions",
  },
];

// Super-admin-only for now — see the comment on BASE_NAV_ITEMS above.
const EXTENDED_NAV_ITEMS = [
  { to: "/admin/dsa/catalog", label: "DSA Catalog", icon: Code, cy: "admin-dsa-catalog" },
  {
    to: "/admin/dsa/curriculum",
    label: "Curriculum",
    icon: GraduationCap,
    cy: "admin-dsa-curriculum",
  },
  { to: "/admin/dsa/languages", label: "Languages", icon: Languages, cy: "admin-dsa-languages" },
  { to: "/admin/knowledge/blogs", label: "Blogs Moderation", icon: Newspaper, cy: "admin-blogs" },
  {
    to: "/admin/question-bank/materials",
    label: "Materials Moderation",
    icon: Archive,
    cy: "admin-materials",
  },
  {
    to: "/admin/system-design/cases",
    label: "System Design Cases",
    icon: Building,
    cy: "admin-sd-cases",
  },
  {
    to: "/admin/system-design/patterns",
    label: "Scalability Patterns",
    icon: Layers,
    cy: "admin-sd-patterns",
  },
  {
    to: "/admin/interview-simulator/mock-interviews",
    label: "Mock Interviews",
    icon: Video,
    cy: "admin-mock-interviews",
  },
  {
    to: "/admin/interview-simulator/company-problems",
    label: "Company Problems",
    icon: Building2,
    cy: "admin-company-problems",
  },
  {
    to: "/admin/interview-simulator/behavioral-questions",
    label: "Behavioral Questions",
    icon: HelpCircle,
    cy: "admin-behavioral-questions",
  },
];

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar variant="inset" collapsible="icon" side="left">
        <SidebarHeader className="flex flex-row items-center justify-center p-4 border-b">
          <ShieldCheck />
          {state !== "collapsed" && (
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-xl font-bold text-primary">Admin</h1>
              <p className="text-xs text-muted-foreground mt-1">Content &amp; user management</p>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="gap-3">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to app">
                <Link
                  to="/dsa"
                  data-cy="admin-back-to-app"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft />
                  {state !== "collapsed" && <span>Back to app</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {BASE_NAV_ITEMS.map(({ to, label, icon: Icon, cy }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton asChild tooltip={label}>
                  <Link
                    to={to}
                    data-cy={`sidebar-nav-${cy}`}
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith(to)
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Icon />
                    {state !== "collapsed" && <span>{label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {isSuperAdmin() &&
              EXTENDED_NAV_ITEMS.map(({ to, label, icon: Icon, cy }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <Link
                      to={to}
                      data-cy={`sidebar-nav-${cy}`}
                      className={`flex items-center gap-2 ${
                        location.pathname.startsWith(to)
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                    >
                      <Icon />
                      {state !== "collapsed" && <span>{label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            {isSuperAdmin() && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Invite Admins">
                  <Link
                    to="/super-admin/invites"
                    data-cy="sidebar-nav-super-admin-invites"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/super-admin/invites")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <ShieldCheck />
                    {state !== "collapsed" && <span>Invite Admins</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="mt-auto p-4 border-t">
          <SidebarMenuButton asChild>
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 w-full justify-start"
              data-cy="admin-sidebar-logout-trigger"
            >
              <LogOut />
              {state !== "collapsed" && <span>Logout</span>}
            </Button>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <LogoutModal open={showLogoutModal} onOpenChange={setShowLogoutModal} />

      <SidebarInset className="flex flex-col">
        <TopNav />
        <div className="p-4 flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </div>
  );
};

export default AdminLayout;
