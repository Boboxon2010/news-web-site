import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await query('SELECT photo_url FROM leaders WHERE id = $1 LIMIT 1', [params.id]);
    const dataUrl = result.rows[0]?.photo_url;
    if (typeof dataUrl !== 'string') return NextResponse.json({ error: 'Rasm topilmadi' }, { status: 404 });

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=\r\n]+)$/.exec(dataUrl);
    if (!match || !supportedImageTypes.has(match[1])) {
      return NextResponse.json({ error: 'Rasm formati qo‘llab-quvvatlanmaydi' }, { status: 415 });
    }

    return new Response(Buffer.from(match[2], 'base64'), {
      headers: {
        'Content-Type': match[1],
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}