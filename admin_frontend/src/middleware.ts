import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth pages, static files, and API routes
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if accessing dashboard routes
  if (pathname.startsWith('/dashboard')) {
    try {
      // Check authentication by calling the backend
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8080';
      const authResponse = await fetch(`${baseUrl}/auth/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include',
      });

      if (!authResponse.ok) {
        // Redirect to login if not authenticated
        const loginUrl = new URL('/auth/sign-in', request.url);
        return NextResponse.redirect(loginUrl);
      }

      const authData = await authResponse.json();
      if (!authData.user) {
        // Redirect to login if no user data
        const loginUrl = new URL('/auth/sign-in', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // User is authenticated, continue
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth check failed:', error);
      // Redirect to login on error
      const loginUrl = new URL('/auth/sign-in', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
