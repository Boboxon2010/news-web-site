import { NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { query } from '@/lib/db';

export const revalidate = 3600;

const defaultPageText = {
  aboutTitle: "O'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi tarixi va maqsadi",
  aboutSubtitle: "Muassasamiz O'zbekiston Respublikasi Ichki ishlar vazirligi tizimida chuqurlashtirilgan bilim va yuksak ma'naviy-intizomiy tayyorgarlikka ega kadrlarni yetishtirib beradi.",
  newsTitle: "Yangiliklar va E'lonlar",
  newsSubtitle: "Litseyimizdagi barcha rasmiy e'lonlar, tadbirlar hamda muhim yangiliklar minbari.",
};

const getCachedSettingsRow = unstable_cache(
  async () => {
    const result = await query(`
      SELECT hero_title, hero_subtitle, badge_text, about_title, about_subtitle,
        news_title, news_subtitle, address, phone, email, working_hours, postal_code
      FROM site_settings
      ORDER BY id DESC
      LIMIT 1
    `);
    return result.rows[0] ?? null;
  },
  ['site-settings-row-v1'],
  { revalidate: 3600, tags: ['site-settings'] }
);

export async function GET() {
  try {
    const row = await getCachedSettingsRow();
    if (!row) {
      return NextResponse.json({
        heroTitle: "O'zbekiston Respublikasi IIV Xorazm akademik litseyi",
        heroSubtitle: "Kelajak posbonlari va bilimli yoshlarni tarbiyalash maskani.",
        badgeText: "O'zbekiston Respublikasi Ichki Ishlar Vazirligi Tizimidagi Muassasa",
        ...defaultPageText,
        address: 'Xorazm viloyati, Urganch shahri',
        phone: '',
        email: '',
        workingHours: '',
        postalCode: ''
      });
    }

    return NextResponse.json({
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      badgeText: row.badge_text,
      aboutTitle: row.about_title || defaultPageText.aboutTitle,
      aboutSubtitle: row.about_subtitle || defaultPageText.aboutSubtitle,
      newsTitle: row.news_title || defaultPageText.newsTitle,
      newsSubtitle: row.news_subtitle || defaultPageText.newsSubtitle,
      address: row.address,
      phone: row.phone,
      email: row.email,
      workingHours: row.working_hours,
      postalCode: row.postal_code || ''
    });
  } catch (error) {
    return NextResponse.json({ error: 'Database xatosi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { heroTitle, heroSubtitle, badgeText, aboutTitle, aboutSubtitle, newsTitle, newsSubtitle, address, phone, email, workingHours, postalCode } = body;

    const updateResult = await query(
      `UPDATE site_settings 
      SET hero_title = $1, hero_subtitle = $2, badge_text = $3, about_title = $4, about_subtitle = $5, news_title = $6, news_subtitle = $7, address = $8, phone = $9, email = $10, working_hours = $11, postal_code = $12, updated_at = NOW()
       WHERE id = (SELECT id FROM site_settings ORDER BY id ASC LIMIT 1)
       RETURNING id`,
      [heroTitle, heroSubtitle, badgeText, aboutTitle || defaultPageText.aboutTitle, aboutSubtitle || defaultPageText.aboutSubtitle, newsTitle || defaultPageText.newsTitle, newsSubtitle || defaultPageText.newsSubtitle, address, phone, email, workingHours, postalCode || '']
    );

    if (updateResult.rowCount === 0) {
      await query(
        `INSERT INTO site_settings (hero_title, hero_subtitle, badge_text, about_title, about_subtitle, news_title, news_subtitle, address, phone, email, working_hours, postal_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [heroTitle, heroSubtitle, badgeText, aboutTitle || defaultPageText.aboutTitle, aboutSubtitle || defaultPageText.aboutSubtitle, newsTitle || defaultPageText.newsTitle, newsSubtitle || defaultPageText.newsSubtitle, address, phone, email, workingHours, postalCode || '']
      );
    }

    revalidateTag('site-settings');
    return NextResponse.json({ success: true, postalCode: postalCode || '' });
  } catch (error) {
    return NextResponse.json({ error: 'Sozlamalarni saqlashda xatolik' }, { status: 500 });
  }
}
