'use client';

import { LogOut } from 'lucide-react';

import { logout } from '@/actions/user-actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const handleSignOut = async () => {
    await logout();
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleSignOut}
      className='gap-2'
    >
      <LogOut className='h-4 w-4' />
      Logout
    </Button>
  );
}
