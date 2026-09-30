import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signJwtToken, verifyJwtToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';

export async function POST(request: Request) {
  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1').split(',')[0].trim();
  if (!checkRateLimit(`credentials:${ip}`, 5, 60000)) {
    return NextResponse.json({ error: 'Juda ko‘p urinish. Bir daqiqadan keyin qayta urinib ko‘ring.' }, { status: 429 });
  }

  const token = cookies().get('admin_session')?.value;
  const session = token ? await verifyJwtToken(token) : null;
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json({ error: 'Admin sessiyasi yaroqsiz. Qayta tizimga kiring.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const requestedUsername = typeof body.newUsername === 'string' ? body.newUsername.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!currentPassword) {
      return NextResponse.json({ error: 'Joriy parolni kiriting.' }, { status: 400 });
    }
    if (!requestedUsername && !newPassword) {
      return NextResponse.json({ error: 'Yangi login yoki yangi parol kiriting.' }, { status: 400 });
    }
    if (requestedUsername && !/^[a-zA-Z0-9._-]{3,32}$/.test(requestedUsername)) {
      return NextResponse.json({ error: 'Login 3–32 belgidan iborat bo‘lsin; faqat harf, raqam, nuqta, chiziqcha va pastki chiziq ishlating.' }, { status: 400 });
    }
    if (newPassword) {
      const strongPassword = newPassword.length >= 12 && /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) && /\d/.test(newPassword) && /[^a-zA-Z\d]/.test(newPassword);
      if (!strongPassword) {
        return NextResponse.json({ error: 'Yangi parol kamida 12 belgi va katta-kichik harf, raqam hamda maxsus belgidan iborat bo‘lsin.' }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'Yangi parol va tasdiqlash paroli mos emas.' }, { status: 400 });
      }
    }

    const adminResult = session.id
      ? await query('SELECT id, username, password_hash FROM admins WHERE id = $1 LIMIT 1', [session.id])
      : await query('SELECT id, username, password_hash FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1', [session.username]);
    const admin = adminResult.rows[0];
    if (!admin) return NextResponse.json({ error: 'Admin hisobi topilmadi.' }, { status: 404 });

    const legacySeedPassword = admin.username === 'admin' && admin.password_hash === 'admin' && currentPassword === 'admin123';
    const passwordMatches = admin.password_hash.startsWith('$2')
      ? await bcrypt.compare(currentPassword, admin.password_hash)
      : legacySeedPassword;
    if (!passwordMatches) return NextResponse.json({ error: 'Joriy parol noto‘g‘ri.' }, { status: 400 });

    const username = requestedUsername || admin.username;
    if (username.toLowerCase() !== admin.username.toLowerCase()) {
      const duplicate = await query('SELECT id FROM admins WHERE LOWER(username) = LOWER($1) AND id <> $2 LIMIT 1', [username, admin.id]);
      if (duplicate.rowCount) return NextResponse.json({ error: 'Bu login band. Boshqa login tanlang.' }, { status: 409 });
    }

    const passwordToStore = newPassword || (admin.password_hash.startsWith('$2') ? '' : currentPassword);
    const passwordHash = passwordToStore ? await bcrypt.hash(passwordToStore, 12) : admin.password_hash;
    await query(
      'UPDATE admins SET username = $1, password_hash = $2, updated_at = NOW() WHERE id = $3',
      [username, passwordHash, admin.id]
    );

    const newToken = await signJwtToken({ id: admin.id, username, role: 'superadmin' });
    const response = NextResponse.json({ success: true, username, message: 'Login va parol sozlamalari yangilandi.' });
    response.cookies.set('admin_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Akkaunt ma’lumotlarini saqlashda server yoki baza xatoligi yuz berdi.' }, { status: 500 });
  }
}
