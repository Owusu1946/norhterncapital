import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTEdge } from './lib/jwt-edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("\n🛡️ Middleware: Checking path:", pathname);

  // --- ADMIN ROUTES PROTECTION ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    console.log("🔒 Protected admin route detected");
    const adminToken = request.cookies.get('admin_auth_token')?.value;
    console.log("🍪 Admin auth token present:", !!adminToken);

    if (!adminToken) {
      console.log("❌ No admin token found, redirecting to login");
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log("🔍 Verifying admin token...");
    const decoded = verifyJWTEdge(adminToken);
    console.log("Admin token decoded:", decoded ? "✅ Valid" : "❌ Invalid");

    if (!decoded) {
      console.log("❌ Invalid admin token, redirecting to login");
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_auth_token');
      return response;
    }

    console.log("👤 User role:", decoded.role);

    if (decoded.role !== 'admin' && decoded.role !== 'staff') {
      console.log("❌ Not admin/staff, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    console.log("✅ Access granted");
    return NextResponse.next();
  }

  // Redirect authenticated admin users away from login page
  if (pathname === '/admin/login') {
    console.log("📝 On admin login page, checking if already authenticated");
    const adminToken = request.cookies.get('admin_auth_token')?.value;
    console.log("🍪 Admin token present:", !!adminToken);

    if (adminToken) {
      const decoded = verifyJWTEdge(adminToken);
      console.log("Token valid:", !!decoded);

      if (decoded && (decoded.role === 'admin' || decoded.role === 'staff')) {
        console.log("✅ Already authenticated, redirecting to /admin/dashboard");
        const adminUrl = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  // --- POS DASHBOARD ROUTES PROTECTION ---
  // Protect /dashboard routes EXCEPT /dashboard/auth/* (login/signup pages)
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/auth')) {
    console.log("🔒 Protected POS dashboard route detected");
    const posAuthToken = request.cookies.get('pos_auth_token')?.value;
    console.log("🍪 POS Auth token present:", !!posAuthToken);

    if (!posAuthToken) {
      console.log("❌ No POS token found, redirecting to staff login");
      const loginUrl = new URL('/dashboard/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log("🔍 Verifying POS token...");
    const decoded = verifyJWTEdge(posAuthToken);
    console.log("POS Token decoded:", decoded ? "✅ Valid" : "❌ Invalid");

    if (!decoded) {
      console.log("❌ Invalid POS token, redirecting to staff login");
      const loginUrl = new URL('/dashboard/auth/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('pos_auth_token');
      return response;
    }

    console.log("👤 Staff role:", decoded.role);

    // Only staff and admin can access POS dashboard
    if (decoded.role !== 'staff' && decoded.role !== 'admin') {
      console.log("❌ Not staff/admin, redirecting to home");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    console.log("✅ POS Dashboard access granted");
    return NextResponse.next();
  }

  // Redirect authenticated staff away from login/signup pages
  if (pathname.startsWith('/dashboard/auth')) {
    console.log("📝 On staff auth page, checking if already authenticated");
    const posAuthToken = request.cookies.get('pos_auth_token')?.value;
    console.log("🍪 POS Token present:", !!posAuthToken);

    if (posAuthToken) {
      const decoded = verifyJWTEdge(posAuthToken);
      console.log("POS Token valid:", !!decoded);

      if (decoded && (decoded.role === 'staff' || decoded.role === 'admin')) {
        console.log("✅ Already authenticated, redirecting to /dashboard");
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  console.log("✅ Allowing access to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
