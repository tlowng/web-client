// src/components/admin/admin-panel.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateCategoryDialog } from './create-category-dialog';
import { CreateProblemDialog } from './create-problem-dialog';
import { 
  Shield, 
  Plus, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Folder,
  FileText,
  TestTube,
  Settings,
  TrendingUp,
  List,
  ExternalLink
} from 'lucide-react';
import { getMe } from '@/api';
import type { UserProfile } from '@/types';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

function AdminPanelContent() {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await getMe();
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);


  const handleCategoryCreated = () => {
    // Refresh categories list if needed
    // For now, just log a message
    console.log('Category created successfully');
  };

  const handleProblemCreated = () => {
    // Could refresh problems list or show success message
    console.log('Problem created successfully');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome back, <strong>{currentUser?.username}</strong>. Manage your platform from here.
          </p>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Common administrative tasks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CreateProblemDialog onProblemCreated={handleProblemCreated}>
              <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <TestTube className="h-6 w-6" />
                <span className="text-center">
                  <div className="font-medium">Create Problem</div>
                  <div className="text-xs opacity-90">Add coding challenge</div>
                </span>
              </Button>
            </CreateProblemDialog>
            
            <CreateCategoryDialog onCategoryCreated={handleCategoryCreated}>
              <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-6 w-6" />
                <span className="text-center">
                  <div className="font-medium">Create Category</div>
                  <div className="text-xs opacity-90">Forum section</div>
                </span>
              </Button>
            </CreateCategoryDialog>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">Roles & permissions</div>
              </span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">Moderate Posts</div>
                <div className="text-xs text-muted-foreground">Forum moderation</div>
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage platform content and resources
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 justify-start p-4" asChild>
              <Link to="/admin/problems">
                <div className="flex items-center gap-2 mb-2">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <div className="font-medium">Problems Management</div>
                  <div className="text-xs text-muted-foreground">View, edit, delete problems</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-24 flex-col gap-2 justify-start p-4">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="h-5 w-5 text-green-600" />
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-center">
                <div className="font-medium">Categories Management</div>
                <div className="text-xs text-muted-foreground">Forum categories</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-24 flex-col gap-2 justify-start p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-center">
                <div className="font-medium">Submissions Review</div>
                <div className="text-xs text-muted-foreground">Monitor submissions</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Management */}
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor and configure system settings
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">Analytics</div>
                <div className="text-xs text-muted-foreground">Platform stats</div>
              </span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">Settings</div>
                <div className="text-xs text-muted-foreground">Configuration</div>
              </span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">User Management</div>
                <div className="text-xs text-muted-foreground">User accounts</div>
              </span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-center">
                <div className="font-medium">Reports</div>
                <div className="text-xs text-muted-foreground">Generate reports</div>
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest platform activities requiring attention
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <TestTube className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New problem submissions pending review</p>
                <p className="text-xs text-muted-foreground">Last updated 2 hours ago</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/problems">
                  <List className="h-4 w-4 mr-2" />
                  Review
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Forum posts reported by users</p>
                <p className="text-xs text-muted-foreground">Last updated 4 hours ago</p>
              </div>
              <Button variant="outline" size="sm">
                Moderate
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New user registrations this week</p>
                <p className="text-xs text-muted-foreground">25 new members joined</p>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const AdminPanel = withAdminAuth(AdminPanelContent);
