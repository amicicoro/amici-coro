'use client';

import { PropsWithChildren } from 'react';

import { useAuth } from '@/providers/auth-provider';
import type { Role } from '@/types/user';
import { LogoutButton } from "@/components/admin/logout-button";

export type RequiresRoleProps = PropsWithChildren<{
  allowedRoles: Role[];
}>;

export const RequiresRole = ({ allowedRoles, children }: RequiresRoleProps) => {
  const { user } = useAuth();
  if (!user || !user.roles.some(role => allowedRoles.includes(role))) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='p-8 text-center border rounded bg-white'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              You do not have sufficient privileges to access this page. Please
              speak to the site admin.
            </h2>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
