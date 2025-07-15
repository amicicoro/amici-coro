'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

interface AuthedPageProps {
  children: React.ReactNode;
}

export default function AuthedPage({ children }: AuthedPageProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='p-8 text-center border rounded bg-white'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              You must be logged in to view this page
            </h2>
            <Button asChild size='lg' className='bg-sage-700 hover:bg-sage-800'>
              <Link href='/login'>Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
