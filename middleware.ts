import { NextRequest, NextResponse } from 'next/server';
import { userSessionMiddleware } from './middleware/session-middlesware';
import { adminMiddleware } from './middleware/admin-middleware';
import { Middleware } from '@/types/middleware';

function compose(middlewares: Middleware[]): Middleware {
  return (request, next) => {
    let i = -1;
    function dispatch(index: number): Promise<NextResponse> {
      if (index <= i) throw new Error('next() called multiple times');
      i = index;
      let fn = middlewares[index];
      if (index === middlewares.length) fn = next;
      if (!fn) return Promise.resolve(NextResponse.next());
      return Promise.resolve(fn(request, () => dispatch(index + 1)));
    }
    return dispatch(0);
  };
}

const chain = compose([adminMiddleware, userSessionMiddleware]);

export function middleware(request: NextRequest) {
  return chain(request, () => Promise.resolve(NextResponse.next()));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
