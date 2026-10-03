import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://xorazmiival.uz').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPaths = ['', '/about', '/admissions', '/news', '/gallery', '/contact'];

  return publicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === '' || path === '/news' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/news' ? 0.9 : 0.7,
  }));
}