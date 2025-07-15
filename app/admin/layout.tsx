import type React from 'react';

import { RequiresRole } from '@/components/layout/requires-role';
import AuthedPage from '@/components/pages/authed-page';
import { ADMIN } from '@/types/user';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthedPage>
      <RequiresRole allowedRoles={[ADMIN]}>
        <div className='min-h-screen bg-background'>{children}</div>
      </RequiresRole>
    </AuthedPage>
  );
}
