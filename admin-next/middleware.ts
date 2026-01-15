import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    // Get session from cookies or headers
    // For now, we'll let the page handle auth check
    // In production, you might want to check session here
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

