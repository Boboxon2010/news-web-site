import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const revalidate = 3600;

const getCachedNewsDetail = unstable_cache(
  async (id: string) => {
    const result = await query(`
      SELECT
        news.id,
        news.title,
        news.category,
        news.news_date,
        news.short_desc,
        news.full_content,
        COALESCE((
          SELECT json_agg(image.image_url ORDER BY image.display_order, image.id)
          FROM news_images AS image
          WHERE image.news_id = news.id
        ), '[]'::json) AS images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', file.id,
            'file_name', file.file_name,
            'file_url', file.file_url,
            'file_type', file.file_type
          ) ORDER BY file.id)
          FROM news_files AS file
          WHERE file.news_id = news.id
        ), '[]'::json) AS files
      FROM news
      WHERE news.id = $1
      LIMIT 1
    `, [id]);

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: String(row.id),
      title: row.title,
      category: row.category,
      date: row.news_date,
      shortDesc: row.short_desc,
      fullContent: row.full_content,
      images: row.images,
      files: row.files.map((file: { id: number; file_name: string; file_url: string; file_type: string }) => ({
        id: String(file.id),
        name: file.file_name,
        dataUrl: file.file_url,
        type: file.file_type,
      })),
    };
  },
  ['news-detail-v1'],
  { revalidate: 3600, tags: ['news'] }
);

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const news = await getCachedNewsDetail(params.id);
    if (!news) return NextResponse.json({ error: 'Yangilik topilmadi' }, { status: 404 });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}