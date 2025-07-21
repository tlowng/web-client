// src/pages/AdminProblemsPage.tsx
import { AdminProblemsList } from '@/components/admin/admin-problems-list';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

function AdminProblemsPage() {
  useBreadcrumbTitle('Admin - Problems');

  return (
    <div className="p-4">
      <AdminProblemsList />
    </div>
  );
}

export default withAdminAuth(AdminProblemsPage);
