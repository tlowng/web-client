// src/components/auth/withAdminAuth.tsx
import { useState, useEffect, type ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getMe } from '@/api';
import type { UserProfile } from '@/types';

export function withAdminAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const WithAdminAuth = (props: P) => {
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
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">Verifying access...</p>
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

    return <WrappedComponent {...props} />;
  };

  return WithAdminAuth;
}
