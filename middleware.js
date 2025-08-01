import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  try {
    console.log('Middleware running for path:', pathname);

    // Try to import NextAuth if available
    let getToken;
    try {
      const nextAuth = await import('next-auth/jwt');
      getToken = nextAuth.getToken;
    } catch (error) {
      console.log('NextAuth not available, allowing all requests');
      return NextResponse.next();
    }
    
    // Get the NextAuth token
    let token;
    try {
      token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev_secret_key' 
      });
    } catch (error) {
      console.log('Error getting token:', error);
      // If there's an error getting the token, allow the request to continue
      return NextResponse.next();
    }
    
    console.log('Middleware token check:', { pathname, hasToken: !!token });

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        console.log('No NextAuth token found, redirecting to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      console.log('NextAuth token verified, allowing dashboard access');
      return NextResponse.next();
    }

    // Allow access to login/register pages for unauthenticated users
    if (pathname === '/login' || pathname === '/register') {
      if (token) {
        console.log('User already authenticated, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      console.log('User not authenticated, allowing access to login/register');
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's any error in middleware, allow the request to continue
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/test-auth']
}; 