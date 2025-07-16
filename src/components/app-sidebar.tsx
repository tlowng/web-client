import * as React from "react"
import {
  Home,
  List,
  FileText,
  Users,
  GitFork,
} from "lucide-react"
import { Link } from 'react-router-dom';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle";

// Updated data for navigation
// The active state will be determined dynamically in NavMain
const navData = {
  navMain: [
    {
      title: "Home (Forum)",
      url: "/",
      icon: Home,
    },
    {
      title: "Problem List",
      url: "/problems",
      icon: List,
    },
    {
      title: "My Submissions",
      url: "/submissions/user-submissions",
      icon: FileText,
    },
    {
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: GitFork,
    },
  ],
}

function Brand() {
    const { state } = useSidebar()

    return (
        <Link to="/">
            {state === 'collapsed' ? (
                <img src="/icon.webp" alt="AwlOJ Icon" className="w-8 h-8" />
            ) : (
                <span className="text-xl font-bold text-foreground">AwlOJ</span>
            )}
        </Link>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center p-4 justify-center">
            <Brand />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter className="flex items-center justify-center gap-2">
        <ThemeToggle />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
