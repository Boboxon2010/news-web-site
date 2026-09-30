import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM leaders ORDER BY id DESC`);
    const leaders = res.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      role: row.role,
      spec: row.spec,
      photoUrl: row.photo_url
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
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
