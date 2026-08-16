import { useEffect, useState } from "react";
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
  Book,
  Building,
  Code,
  Laptop,
  LogOut,
  MessageSquareCode,
  PieChart,
  Users2,
} from "lucide-react";
import Button from "../ui/button";
import LogoutModal from "../LogoutModal";

interface MainLayoutProps {
  children?: React.ReactNode; // Made optional since we're using Outlet
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close mobile sidebar when navigating to a new route
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        document.documentElement.classList.remove("sidebar-open");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [location]);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar variant="inset" collapsible="icon" side="left">
        <SidebarHeader className="flex flex-row items-center justify-center p-4 border-b">
          <MessageSquareCode />
          {state !== "collapsed" && (
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-xl font-bold text-primary">CodePrep</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Interview Ready
              </p>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="gap-3">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="DSA Tracker">
                <Link
                  to="/dsa"
                  data-cy="sidebar-nav-dsa"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/dsa")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Code />
                  {state !== "collapsed" && <span>DSA Tracker</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Interview Prep">
                <Link
                  to="/interview"
                  data-cy="sidebar-nav-interview"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/interview")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Users2 />
                  {state !== "collapsed" && <span>Interview Prep</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="System Design">
                <Link
                  to="/system-design"
                  data-cy="sidebar-nav-system-design"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/system-design")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Building />
                  {state !== "collapsed" && <span>System Design</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Knowledge Base">
                <Link
                  to="/knowledge"
                  data-cy="sidebar-nav-knowledge"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/knowledge")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Book />
                  {state !== "collapsed" && <span>Knowledge Base</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Technical Interview">
                <Link
                  to="/technical-interview"
                  data-cy="sidebar-nav-technical-interview"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/technical-interview")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <Laptop />
                  {state !== "collapsed" && <span>Technical Interview</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Analytics">
                <Link
                  to="/analytics"
                  data-cy="sidebar-nav-analytics"
                  className={`flex items-center gap-2 ${
                    location.pathname.startsWith("/analytics")
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                >
                  <PieChart />
                  {state !== "collapsed" && <span>Analytics</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="mt-auto p-4 border-t">
          <SidebarMenuButton asChild>
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 w-full justify-start"
              data-cy="sidebar-logout-trigger"
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

export default MainLayout;
