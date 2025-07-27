import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  console.log('Middleware running for path:', pathname);

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;
    console.log('Dashboard access attempt, token present:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_key'));
      console.log('Token verified successfully');
      return NextResponse.next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from login/register pages
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get('token')?.value;
    console.log('Login/Register access, token present:', !!token);

    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'dev_secret_key'));
        console.log('Valid token found, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        console.log('Invalid token, allowing access to login/register');
        // Token is invalid, continue to login/register
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/test-auth']
}; 