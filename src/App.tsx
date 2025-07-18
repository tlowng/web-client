// src/App.tsx
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForumPage from './pages/ForumPage';
import ForumCategoryPage from './pages/ForumCategoryPage';
import ForumTopicPage from './pages/ForumTopicPage';
import UserSubmissionsPage from './pages/UserSubmissionsPage';
import MembersPage from './pages/MembersPage';
import GroupsPage from './pages/GroupsPage';

export default function App() {
  return (
    <BrowserRouter>
      <BreadcrumbProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <DynamicBreadcrumb />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Routes>
                <Route path="/" element={<ForumPage />} />
                <Route path="/forum/:slug" element={<ForumCategoryPage />} />
                <Route path="/forum/topic/:slug" element={<ForumTopicPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problems/:id" element={<ProblemDetailPage />} />
                <Route path="/submissions/user-submissions" element={<UserSubmissionsPage />} />
                <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/groups" element={<GroupsPage />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
      <Toaster />
    </BrowserRouter>
  );
}