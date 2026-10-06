import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { query } from '@/lib/db';

export const revalidate = 3600;

const normalizeImages = (images: unknown): string[] => {
  if (!Array.isArray(images)) return [];

  return images
    .map((img) => {
      if (typeof img === 'string') return img.trim();
      if (img && typeof img === 'object' && 'image_url' in img && typeof img.image_url === 'string') {
        return img.image_url.trim();
      }
      return null;
    })
    .filter((img): img is string => Boolean(img && img.length > 0));
};

const getCachedNewsRows = unstable_cache(
  async () => {
    const result = await query(`
      SELECT
        n.id,
        n.title,
        n.category,
        n.news_date,
        n.short_desc,
        n.full_content,
        COALESCE((
          SELECT json_agg(image.image_url ORDER BY image.display_order, image.id)
          FROM news_images AS image
          WHERE image.news_id = n.id
        ), '[]'::json) AS images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', file.id,
            'file_name', file.file_name,
            'file_url', file.file_url,
            'file_type', file.file_type
          ) ORDER BY file.id)
          FROM news_files AS file
          WHERE file.news_id = n.id
        ), '[]'::json) AS files
      FROM news n
      ORDER BY n.created_at DESC
    `);
    return result.rows;
  },
  ['news-list-v1'],
  { revalidate: 3600, tags: ['news'] }
);

export async function GET() {
  try {
    const rows = await getCachedNewsRows();
    const newsData = rows.map((row: any) => ({
      id: row.id.toString(),
      title: row.title,
      category: row.category,
      date: row.news_date,
      shortDesc: row.short_desc,
      fullContent: row.full_content,
      images: normalizeImages(row.images),
      files: Array.isArray(row.files) ? row.files.map((file: any) => ({
        id: file.id.toString(),
        name: file.file_name,
        dataUrl: file.file_url,
        type: file.file_type
      })) : []
    }));

    return NextResponse.json(newsData);
  } catch (error) {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, category, date, shortDesc, fullContent, images, files } = body;

    const insertNews = await query(
      `INSERT INTO news (title, category, news_date, short_desc, full_content) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, category, date || new Date().toLocaleDateString('uz-UZ'), shortDesc, fullContent]
    );

    const newsId = insertNews.rows[0].id;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await query(
          `INSERT INTO news_images (news_id, image_url, display_order) VALUES ($1, $2, $3)`,
          [newsId, images[i], i]
        );
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        await query(
          `INSERT INTO news_files (news_id, file_name, file_url, file_type) VALUES ($1, $2, $3, $4)`,
          [newsId, file.name, file.dataUrl, file.type]
        );
      }
    }

    revalidateTag('news');
    return NextResponse.json({ success: true, id: newsId });
  } catch (error) {
    return NextResponse.json({ error: 'Saqlashda xatolik bo\'ldi' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, category, date, shortDesc, fullContent, images, files } = body;
    if (!id || !title || !category || !fullContent) {
      return NextResponse.json({ error: 'Yangilik ma’lumotlari to‘liq kiritilmadi' }, { status: 400 });
    }

    const updated = await query(
      `UPDATE news SET title = $1, category = $2, news_date = $3, short_desc = $4, full_content = $5, updated_at = NOW()
       WHERE id = $6 RETURNING id`,
      [title, category, date || new Date().toLocaleDateString('uz-UZ'), shortDesc, fullContent, id]
    );
    if (updated.rowCount === 0) return NextResponse.json({ error: 'Yangilik topilmadi' }, { status: 404 });

    await query('DELETE FROM news_images WHERE news_id = $1', [id]);
    await query('DELETE FROM news_files WHERE news_id = $1', [id]);
    for (const [index, image] of (images || []).entries()) {
      await query('INSERT INTO news_images (news_id, image_url, display_order) VALUES ($1, $2, $3)', [id, image, index]);
    }
    for (const file of files || []) {
      await query('INSERT INTO news_files (news_id, file_name, file_url, file_type) VALUES ($1, $2, $3, $4)', [id, file.name, file.dataUrl, file.type]);
    }

    revalidateTag('news');
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: 'Yangilikni yangilashda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID kiritilmadi' }, { status: 400 });

    await query(`DELETE FROM news WHERE id = $1`, [id]);
    revalidateTag('news');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'O\'chirishda xatolik' }, { status: 500 });
  }
}
