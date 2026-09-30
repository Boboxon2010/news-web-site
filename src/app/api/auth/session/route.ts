import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth';

export async function GET() {
  const token = cookies().get('admin_session')?.value;
  const session = token ? await verifyJwtToken(token) : null;

  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: session.username });
}
