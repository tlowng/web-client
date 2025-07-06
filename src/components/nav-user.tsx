import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Loader2, // Import Loader2 for loading state
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getMe, UserProfile } from "@/api"; // Import getMe and UserProfile

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true); // Add loading state

  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getMe();
          setCurrentUser(response.data);
        } catch (error: any) {
          console.error("Failed to fetch user data:", error);
          // If token is invalid or expired, clear it and redirect to login
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            setCurrentUser(null);
            navigate('/login');
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [navigate]); // Add navigate to dependency array

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="w-full justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading user...
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentUser.avatar || "/avatars/user.jpg"} alt={currentUser.username} />
                  <AvatarFallback className="rounded-lg">{currentUser.username ? currentUser.username.charAt(0).toUpperCase() : ''}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{currentUser.username}</span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={currentUser.avatar || "/avatars/user.jpg"} alt={currentUser.username} />
                    <AvatarFallback className="rounded-lg">{currentUser.username ? currentUser.username.charAt(0).toUpperCase() : ''}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{currentUser.username}</span>
                    <span className="truncate text-xs">{currentUser.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col gap-2 p-2 w-full">
            <Button asChild className="w-full">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}