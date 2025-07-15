import { Playfair_Display } from 'next/font/google';
import type React from 'react';
import './globals.css';

import { getUserRoles } from '@/actions/user-actions';
import { CookieConsent } from '@/components/cookie-consent';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { extractSiteUrl } from '@/lib/url-utils';
import { getSession, getUser } from '@/lib/user-utils';
import { AuthProvider } from '@/providers/auth-provider';
import { SiteUrlProvider } from '@/providers/site-url-provider';
import { ToastProvider } from '@/providers/toast-provider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = await getUser();
  const roles = await getUserRoles();

  const siteUrl = await extractSiteUrl();

  return (
    <html lang='en'>
      <body className={playfair.variable}>
        <SiteUrlProvider value={siteUrl}>
          <AuthProvider
            initialSession={session}
            initialUser={user}
            initialRoles={roles}
          >
            <ToastProvider />
            <div className='min-h-screen flex flex-col'>
              <Header />
              {children}
              <Footer />
            </div>
            <CookieConsent />
          </AuthProvider>
        </SiteUrlProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: 'v0.dev',
};
