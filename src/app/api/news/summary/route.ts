import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { NewsSummary } from '@/lib/dataStore';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

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
        ), '[]'::json) AS images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', file.id,
            'file_name', file.file_name,
            'file_url', file.file_url,
            'file_type', file.file_type
          ) ORDER BY file.id)
          FROM news_files AS file
          WHERE file.news_id = news.id AND (file.file_type = 'video' OR file.file_type LIKE 'video/%')
        ), '[]'::json) AS videos
      FROM news
      ORDER BY news.created_at DESC
    `);

    return result.rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      category: row.category,
      date: row.news_date,
      shortDesc: row.short_desc,
      images: normalizeImages(row.images),
      videos: Array.isArray(row.videos) ? row.videos.map((video: any) => ({
        id: String(video.id),
        name: video.file_name,
        dataUrl: video.file_url,
        type: video.file_type,
      })) : [],
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