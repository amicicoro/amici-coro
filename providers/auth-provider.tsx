'use client';

import { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Role } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialSession,
  initialUser,
  initialRoles,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
  initialRoles: Role[] | null;
}) => {
  const authContextValue = initialUser ? {
    user: {
      ...initialUser,
      roles: initialRoles || [],
    },
    session: initialSession,
  } : {};

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
