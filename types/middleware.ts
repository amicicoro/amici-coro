import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (
  request: NextRequest,
  next: () => Promise<NextResponse>,
) => Promise<NextResponse>;
