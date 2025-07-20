// src/pages/AdminProblemsPage.tsx
import { useState, useEffect } from 'react';
import { AdminProblemsList } from '@/components/admin/admin-problems-list';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getMe } from '@/api';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import type { UserProfile } from '@/api';

export default function AdminProblemsPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useBreadcrumbTitle('Admin - Problems');

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
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2">Loading admin panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-4">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AdminProblemsList />
    </div>
  );
}