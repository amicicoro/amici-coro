'use server';

import { ADMIN, Role } from '@/types/user';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import {
  AuthError,
  AuthResponse,
  EmailOtpType,
  User,
} from '@supabase/supabase-js';

export const signUp = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  siteUrl: string,
): Promise<{ error: AuthError | null; user: User | null }> => {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    },
  });
  return { error, user: data?.user };
};

export const login = async (
  email: string,
  password: string,
): Promise<{ error: AuthError | null }> => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error };
};

export const loginWithGoogle = async (
  siteUrl: string,
  next?: string,
): Promise<{ error: AuthError | null }> => {
  const supabase = await createClient();
  const redirectUrl = next
    ? `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`
    : `${siteUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
  if (data.url) {
    return redirect(data.url);
  }
  return { error };
};

export const logout = async (): Promise<{ error: AuthError | null }> => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const exchangeCodeForSession = async (
  code: string,
): Promise<AuthResponse> => {
  const supabase = await createClient();
  return await supabase.auth.exchangeCodeForSession(code);
};

export const verifyOtp = async (
  type: EmailOtpType,
  tokenHash: string,
): Promise<AuthResponse> => {
  const supabase = await createClient();
  return await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });
};

export const getUserRoles = async (): Promise<Role[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  if (error || !data) return [];
  return data.map(row => row.role as Role);
};

export const isAdmin = async () => {
  const roles = await getUserRoles();
  return roles.includes(ADMIN);
};

export const getSession = async () => {
  const supabase = await createClient();
  return await supabase.auth.getSession();
};

export const getUser = async () => {
  const supabase = await createClient();
  return await supabase.auth.getUser();
};
