import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { NewsSummary } from '@/lib/dataStore';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

const getCachedNewsSummaries = unstable_cache(
  async () => {
    const result = await query(`
      SELECT
        news.id,
        news.title,
        news.category,
        news.news_date,
        news.short_desc,
        COALESCE((
          SELECT json_agg(image.image_url ORDER BY image.display_order, image.id)
          FROM news_images AS image
          WHERE image.news_id = news.id
        ), '[]'::json) AS images
      FROM news
      ORDER BY news.created_at DESC
    `);

    return result.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      category: row.category,
      date: row.news_date,
      shortDesc: row.short_desc,
      images: row.images,
    } satisfies NewsSummary));
  },
  ['news-card-summaries-v1'],
  { revalidate: 3600, tags: ['news'] }
);

export async function GET() {
  try {
    return NextResponse.json(await getCachedNewsSummaries());
  } catch {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}