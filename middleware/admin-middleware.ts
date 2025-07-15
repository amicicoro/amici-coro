import { NextResponse } from 'next/server';
import { isAdmin } from '@/actions/user-actions';
import { Middleware } from '@/types/middleware';

export const adminMiddleware: Middleware = async (request, next) => {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/admin/')) {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return next();
};
