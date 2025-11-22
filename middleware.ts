import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTEdge } from './lib/jwt-edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("\n🛡️ Middleware: Checking path:", pathname);

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    console.log("🔒 Protected admin route detected");
    const authToken = request.cookies.get('auth_token')?.value;
    console.log("🍪 Auth token present:", !!authToken);

    // If no token, redirect to admin login
    if (!authToken) {
      console.log("❌ No token found, redirecting to login");
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    console.log("🔍 Verifying token...");
    const decoded = verifyJWTEdge(authToken);
    console.log("Token decoded:", decoded ? "✅ Valid" : "❌ Invalid");
    
    if (!decoded) {
      // Invalid token, redirect to login
      console.log("❌ Invalid token, redirecting to login");
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }

    console.log("👤 User role:", decoded.role);

    // Check if user has admin or staff role
    if (decoded.role !== 'admin' && decoded.role !== 'staff') {
      // Not authorized, redirect to home
      console.log("❌ Not admin/staff, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    // Token is valid, allow access
    console.log("✅ Access granted");
    return NextResponse.next();
  }

  // If on admin login page and already authenticated, redirect to admin dashboard
  if (pathname === '/admin/login') {
    console.log("📝 On login page, checking if already authenticated");
    const authToken = request.cookies.get('auth_token')?.value;
    console.log("🍪 Token present:", !!authToken);
    
    if (authToken) {
      const decoded = verifyJWTEdge(authToken);
      console.log("Token valid:", !!decoded);
      
      if (decoded && (decoded.role === 'admin' || decoded.role === 'staff')) {
        console.log("✅ Already authenticated, redirecting to /admin/dashboard");
        const adminUrl = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  console.log("✅ Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
