import { useEffect } from "react";
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
  SidebarProvider,
  SidebarInset,
} from "../../components/ui/sidebar";
import { Book, Building, Code, LogOut, PieChart, Users2 } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  const location = useLocation();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar variant="inset" collapsible="icon" side="left">
          <SidebarHeader className="flex flex-col items-center justify-center p-4 border-b">
            <h1 className="text-xl font-bold text-primary">CodePrep</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Interview Ready
            </p>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="DSA Tracker">
                  <a
                    href="/dsa"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/dsa")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Code />
                    <span>DSA Tracker</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Interview Prep">
                  <Link
                    to="/interview"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/interview")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Users2 />
                    <span>Interview Prep</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="System Design">
                  <Link
                    to="/system-design"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/system-design")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Building />
                    <span>System Design</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Knowledge Base">
                  <Link
                    to="/knowledge"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/knowledge")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <Book />
                    <span>Knowledge Base</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <Link
                    to="/analytics"
                    className={`flex items-center gap-2 ${
                      location.pathname.startsWith("/analytics")
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <PieChart />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="mt-auto p-4 border-t">
            <SidebarMenuButton asChild>
              <Link to="/auth/login" className="flex items-center gap-2">
                <LogOut />
                <span>Login</span>
              </Link>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <TopNav />
          <div className="p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
