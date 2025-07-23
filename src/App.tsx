// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// UI Components
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

// App Components
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdminPanel } from '@/components/admin/admin-panel';
/*import  AdminContestsPage  from '@/pages/AdminContestsPage';
import CreateContestPage from '@/pages/CreateContestPage';*/
// Contexts
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";

// Pages
import AdminProblemsPage from './pages/AdminProblemsPage';
import ContestsPage from './pages/ContestsPage';
import ContestDetailPage from './pages/ContestDetailPage';
import ContestDashboardPage from './pages/ContestDashboardPage';
import ContestStandingsPage from './pages/ContestStandingsPage';
import ForumCategoryPage from './pages/ForumCategoryPage';
import ForumLeaderboardPage from './pages/ForumLeaderboardPage';
import ForumPage from './pages/ForumPage';
import ForumStatsPage from './pages/ForumStatsPage';
import ForumTopicPage from './pages/ForumTopicPage';
import GroupsPage from './pages/GroupsPage';
import LoginPage from './pages/LoginPage';
import MembersPage from './pages/MembersPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProblemsPage from './pages/ProblemsPage';
import RegisterPage from './pages/RegisterPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSubmissionsPage from './pages/UserSubmissionsPage';

export default function App() {
  return (
    <ErrorBoundary>
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
                  {/* Forum Routes */}
                  <Route path="/" element={<ForumPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/forum/:slug" element={<ForumCategoryPage />} />
                  <Route path="/forum/topic/:slug" element={<ForumTopicPage />} />
                  <Route path="/forum/leaderboard" element={<ForumLeaderboardPage />} />
                  <Route path="/forum/stats" element={<ForumStatsPage />} />
                  <Route path="/forum/profile/:userId" element={<UserProfilePage />} />

                  {/* Problem & Submission Routes */}
                  <Route path="/problems" element={<ProblemsPage />} />
                  <Route path="/problems/:id" element={<ProblemDetailPage />} />
                  <Route path="/submissions/user-submissions" element={<UserSubmissionsPage />} />
                  <Route path="/submissions/:id" element={<SubmissionDetailPage />} />

                  {/* Contest Routes */}
                  <Route path='/contests' element={<ContestsPage/>}/>
                  <Route path='/contests/:id' element={<ContestDetailPage/>}/>
                  <Route path='/contests/:id/dashboard' element={<ContestDashboardPage/>}/>
                  <Route path='/contests/:id/standings' element={<ContestStandingsPage/>}/>
                  
                  {/* User & Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/groups" element={<GroupsPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/problems" element={<AdminProblemsPage/>} />
                  {/*<Route path="/admin/contests" element={<AdminContestsPage/>} />
                  <Route path="/admin/contests/create" element={<CreateContestPage/>} />*/}
                </Routes>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </BreadcrumbProvider>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}