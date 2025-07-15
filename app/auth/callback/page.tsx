'use client';

import { EmailOtpType } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { exchangeCodeForSession, verifyOtp } from '@/actions/user-actions';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) {
        return;
      }
      hasProcessed.current = true;

      let authResponse;
      try {
        if (tokenHash && type) {
          authResponse = await verifyOtp(type, tokenHash);
        }
        if (code) {
          authResponse = await exchangeCodeForSession(code);
        }

        console.log('Auth callback response:', authResponse?.data);

        if (authResponse?.error) {
          console.error('Auth callback error:', authResponse?.error);

          // Check if the error is due to already used auth code
          if (
            authResponse.error.message?.includes('invalid request') ||
            authResponse.error.message?.includes('already been used')
          ) {
            // Auth code already used, but user might still be authenticated
            // Try to get current session
            router.push(next);
            return;
          }

          router.push('/login?error=auth_callback_failed');
          return;
        }

        if (authResponse?.data?.session) {
          router.push(next);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/login?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, code, tokenHash, type, next]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4'></div>
        <p className='text-gray-600'>Completing sign in...</p>
      </div>
    </div>
  );
}
