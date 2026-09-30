import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { checkRateLimit } from '@/lib/security';

export async function GET() {
  try {
    const result = await query(
      `SELECT COUNT(*)::int AS visits FROM site_visits WHERE week_start = DATE_TRUNC('week', CURRENT_DATE)::date`
    );
    return NextResponse.json({ weeklyVisits: result.rows[0]?.visits ?? 0 });
  } catch {
    return NextResponse.json({ error: 'Statistikani olishda xatolik' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip, 60, 60000)) {
    return NextResponse.json({ error: 'So‘rovlar limiti oshdi' }, { status: 429 });
  }

  try {
    const { visitorKey } = await request.json();
    if (typeof visitorKey !== 'string' || !/^[\w-]{12,64}$/.test(visitorKey)) {
      return NextResponse.json({ error: 'Tashrif identifikatori yaroqsiz' }, { status: 400 });
    }

    await query(
      `INSERT INTO site_visits (visitor_key, week_start)
       VALUES ($1, DATE_TRUNC('week', CURRENT_DATE)::date)
       ON CONFLICT (visitor_key, week_start) DO NOTHING`,
      [visitorKey]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Tashrifni qayd etishda xatolik' }, { status: 500 });
  }
}