// src/components/admin/admin-panel.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateCategoryDialog } from './create-category-dialog';
import { Shield, Plus, BarChart3, Users, MessageSquare, Folder } from 'lucide-react';
import { getMe } from '@/api';
import type { UserProfile } from '@/api';

export function AdminPanel() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to check admin access:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading admin panel...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const handleCategoryCreated = () => {
    // Refresh categories list if needed
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CreateCategoryDialog onCategoryCreated={handleCategoryCreated}>
              <Button className="h-20 flex-col gap-2">
                <Plus className="h-6 w-6" />
                Create Category
              </Button>
            </CreateCategoryDialog>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              Manage Users
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              Moderate Posts
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <Folder className="h-8 w-8 mx-auto mb-2" />
                Categories
              </div>
              <p className="text-sm text-muted-foreground">Manage forum sections</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <Users className="h-8 w-8 mx-auto mb-2" />
                Users
              </div>
              <p className="text-sm text-muted-foreground">User management</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                Moderation
              </div>
              <p className="text-sm text-muted-foreground">Content moderation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}