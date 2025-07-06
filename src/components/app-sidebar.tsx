import * as React from "react"
import {
  Home,
  List,
  FileText,
  Users,
  GitFork,
} from "lucide-react"
import { Link } from 'react-router-dom'; // Import Link

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects" // Commented out as per new structure
import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher" // Commented out as per new structure
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

// Updated data for navigation
const navData = {
  navMain: [
    {
      title: "Home (Forum)",
      url: "/", // Assuming / is the forum/home page
      icon: Home,
      isActive: true, // Set active for default page
    },
    {
      title: "Problem List",
      url: "/problems",
      icon: List,
    },
    {
      title: "My Submissions",
      url: "/submissions/user-submissions", // This route needs to be created in App.tsx and a page for it
      icon: FileText,
    },
    {
      title: "Members",
      url: "/members", // This route needs to be created in App.tsx and a page for it
      icon: Users,
    },
    {
      title: "Groups",
      url: "/groups", // This route needs to be created in App.tsx and a page for it
      icon: GitFork,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Removing TeamSwitcher as per new structure, or customize as needed */}
        <div className="flex items-center justify-center p-4">
          <Link to="/" className="text-xl font-bold text-foreground">
            Online Judge
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        {/* Removing NavProjects as per new structure */}
      </SidebarContent>
      <SidebarFooter>
        {/* NavUser will handle displaying logged in user info or login/register buttons */}
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
