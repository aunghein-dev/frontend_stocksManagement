// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';



export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Allow public access only to /login and /signup
  if (pathname === '/login' || pathname === '/signup' || pathname === '/terms-and-conditions') {
    // If logged in, redirect to /dashboard
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Otherwise allow access to login/signup pages
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.md$).*)',
  ],
};