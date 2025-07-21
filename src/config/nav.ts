// src/config/nav.ts
import { Home, List, FileText, Users, GitFork, Trophy, BarChart3 } from "lucide-react";

export const navData = {
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
      title: "Leaderboard",
      url: "/forum/leaderboard",
      icon: Trophy,
    },
    {
      title: "Forum Stats",
      url: "/forum/stats",
      icon: BarChart3, 
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
};
