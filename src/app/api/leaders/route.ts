import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { query } from '@/lib/db';

const getCachedLeaderList = unstable_cache(
  async () => {
    const result = await query(`
      SELECT id, name, role, spec, (photo_url IS NOT NULL AND photo_url <> '') AS has_photo
      FROM leaders
      ORDER BY id DESC
    `);
    return result.rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      role: row.role,
      spec: row.spec,
      photoUrl: row.has_photo ? `/api/leaders/${row.id}/photo` : '',
    }));
  },
  ['leaders-list-v1'],
  { revalidate: 3600, tags: ['leaders'] }
);

export async function GET(request: Request) {
  try {
    const includePhotos = new URL(request.url).searchParams.get('includePhotos') === 'true';
    if (!includePhotos) return NextResponse.json(await getCachedLeaderList());

    const res = await query(`SELECT id, name, role, spec, photo_url FROM leaders ORDER BY id DESC`);
    const leaders = res.rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      role: row.role,
      spec: row.spec,
      photoUrl: row.photo_url || '',
    }));
    return NextResponse.json(leaders);
  } catch (error) {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, spec, photoUrl } = body;

    const res = await query(
      `INSERT INTO leaders (name, role, spec, photo_url) VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, role, spec, photoUrl || null]
    );

    revalidateTag('leaders');
    return NextResponse.json({ success: true, id: res.rows[0].id });
  } catch (error) {
    return NextResponse.json({ error: 'Saqlashda xatolik' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, role, spec, photoUrl } = body;
    if (!id || !name || !role) return NextResponse.json({ error: 'Ma’lumotlar to‘liq kiritilmadi' }, { status: 400 });

    const res = await query(
      `UPDATE leaders SET name = $1, role = $2, spec = $3, photo_url = $4 WHERE id = $5 RETURNING id`,
      [name, role, spec || '', photoUrl || null, id]
    );
    if (res.rowCount === 0) return NextResponse.json({ error: 'Rahbar topilmadi' }, { status: 404 });
    revalidateTag('leaders');
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID topshilmadi' }, { status: 400 });

    await query(`DELETE FROM leaders WHERE id = $1`, [id]);
    revalidateTag('leaders');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
