import { Bell } from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import Button from "../../components/ui/button";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useFetchUserProfile } from "../../api/hooks/useFetchProfile";
import { Skeleton } from "../ui/skeleton";
import ErrorPage from "../../pages/ErrorPage";

const TopNav = () => {
  const { data, isLoading, isError, error } = useFetchUserProfile();

  if (isLoading) {
    return (
      <header className="border-b flex items-center justify-between p-4">
        <div className="flex items-center jusify-center gap-10">
          <SidebarTrigger />
          <Skeleton className="h-6 w-32 hidden md:block mt-2" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-24 hidden md:inline-block rounded-md" />
        </div>
      </header>
    );
  }

  if (isError) {
    return (
      <ErrorPage message={error?.message || "Failed to load user profile."} />
    );
  }

  return (
    <header className="border-b flex items-center justify-between p-4">
      <div className="flex items-center jusify-center gap-10">
        <SidebarTrigger />
        <h1 className="text-xl font-bold hidden md:block mt-2">
          CodePrep Compass
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="md" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {data && data.avatarUrl ? (
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {data.avatarUrl}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {data?.firstName && data.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={logout} className="text-destructive">
              Logout
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;
