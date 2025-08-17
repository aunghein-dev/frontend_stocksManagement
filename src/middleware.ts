// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Allow public access only to /login and /signup
  if (pathname === '/login' || pathname === '/signup' || pathname === '/terms-and-conditions' || pathname === '/pos') {
    // If logged in, redirect to /dashboard
    if (token) {
      // Corrected: Redirect to home ('/') or a specific dashboard, not just '/'.
      // If  dashboard is at /dashboard, change '/' to '/dashboard'
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise allow access to login/signup/terms pages
    return NextResponse.next();
  }

  // For all other routes, redirect to /login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, Next.js internal files, favicon, .md files,
    // AND NOW ALSO .png, .jpg, .jpeg, .gif, .svg files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.md$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};