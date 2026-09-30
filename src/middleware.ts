import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Admin Paneli Himoyasi
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyJwtToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  // Content APIs are public for reads; every mutation requires an admin session.
  const isContentApi = ['/api/news', '/api/leaders', '/api/settings'].includes(pathname);
  const isAdminApi = pathname.startsWith('/api/admin');
  const isPrivateStatsRead = pathname === '/api/stats' && request.method === 'GET';
  const isPrivateContactAction = pathname === '/api/contact' && ['GET', 'PATCH', 'DELETE'].includes(request.method);
  if (isAdminApi || isPrivateStatsRead || isPrivateContactAction || (isContentApi && request.method !== 'GET')) {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifyJwtToken(token))) {
      return NextResponse.json({ error: 'Ruxsat berilmagan (Unauthorized)' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/news', '/api/leaders', '/api/settings', '/api/contact', '/api/stats'],
};
