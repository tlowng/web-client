// src/components/app-sidebar.tsx
import * as React from "react";
import { Link } from 'react-router-dom';

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { navData } from "@/config/nav";

const Brand: React.FC = () => {
    const { state } = useSidebar();

    return (
        <Link to="/">
            {state === 'collapsed' ? (
                <img src="/temp.png" alt="iuhaanhhlamdayhaanhbtk?" className="w-8 h-8" />
            ) : (
                <span className="text-xl font-bold text-accent p-2">AwlOJ</span>
            )}
        </Link>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center">
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
  );
}
