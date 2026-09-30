export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  badgeText: string;
  aboutTitle: string;
  aboutSubtitle: string;
  newsTitle: string;
  newsSubtitle: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  postalCode: string;
}

export interface NewsFile {
  id: string;
  name: string;
  dataUrl: string;
  type: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  shortDesc: string;
  fullContent: string;
  images?: string[];
  files?: NewsFile[];
}

export interface LeaderItem {
  id: string;
  name: string;
  role: string;
  spec: string;
  photoUrl: string;
}

export interface AdminProfile {
  username: string;
  email: string;
  phone: string;
}

const defaultSettings: SiteSettings = {
  heroTitle: "O'zbekiston Respublikasi IIV Xorazm akademik litseyi",
  heroSubtitle: 'Vatanparvar va fidoyi yoshlarni tarbiyalash maskani',
  badgeText: "O'zbekiston Respublikasi Ichki ishlar vazirligi",
  aboutTitle: "O'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi tarixi va maqsadi",
  aboutSubtitle: "Muassasamiz O'zbekiston Respublikasi Ichki ishlar vazirligi tizimida chuqurlashtirilgan bilim va yuksak ma'naviy-intizomiy tayyorgarlikka ega kadrlarni yetishtirib beradi.",
  newsTitle: "Yangiliklar va E'lonlar",
  newsSubtitle: "Litseyimizdagi barcha rasmiy e'lonlar, tadbirlar hamda muhim yangiliklar minbari.",
  address: 'Xorazm viloyati, Urganch shahri',
  phone: '',
  email: '',
  workingHours: '',
  postalCode: '',
};

export function getDefaultSiteSettings(): SiteSettings {
  return { ...defaultSettings };
}

const readStoredValue = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
    if (fallback && typeof fallback === 'object' && parsed && typeof parsed === 'object') {
      return { ...fallback, ...parsed };
    }
    return parsed as T;
  } catch {
    return fallback;
  }
};

const writeStoredValue = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('datastore-update'));
  window.dispatchEvent(new Event('storage_updated'));
};

let cachedNews: NewsItem[] | null = null;
let cachedNewsAt = 0;
let newsRequest: Promise<NewsItem[]> | null = null;
let lastVisitSubmission = '';

export async function getLatestNews(refresh = false): Promise<NewsItem[]> {
  if (!refresh && cachedNews && Date.now() - cachedNewsAt < 10000) return cachedNews;
  if (newsRequest) return newsRequest;

  newsRequest = (async () => {
    try {
      const response = await fetch('/api/news', { cache: 'no-store' });
      if (response.ok) {
        const items = await response.json();
        return Array.isArray(items) ? items as NewsItem[] : getStoredNews();
      }
    } catch {}
    return getStoredNews();
  })();

  try {
    cachedNews = await newsRequest;
    cachedNewsAt = Date.now();
    return cachedNews;
  } finally {
    newsRequest = null;
  }
}

export function getSiteSettings(): SiteSettings {
  return readStoredValue('litsey_site_settings', defaultSettings);
}

export function saveSiteSettings(settings: SiteSettings): void {
  writeStoredValue('litsey_site_settings', settings);
}

export function getStoredNews(): NewsItem[] {
  return readStoredValue<NewsItem[]>('litsey_news', []);
}

export function saveStoredNews(news: NewsItem[]): void {
  cachedNews = news;
  cachedNewsAt = Date.now();
  writeStoredValue('litsey_news', news);
}

export function getStoredLeaders(): LeaderItem[] {
  return readStoredValue<LeaderItem[]>('litsey_leaders', []);
}

export function saveStoredLeaders(leaders: LeaderItem[]): void {
  writeStoredValue('litsey_leaders', leaders);
}

export function getAdminProfile(): AdminProfile {
  return readStoredValue<AdminProfile>('litsey_admin_profile', {
    username: 'admin',
    email: '',
    phone: '',
  });
}

export function getWeeklyVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekKey = weekStart.toISOString().slice(0, 10);
  const stored = readStoredValue<{ week: string; count: number } | null>('litsey_weekly_visits', null);
  return stored?.week === weekKey ? stored.count : 0;
}

export function trackWeeklyVisit(): void {
  if (typeof window === 'undefined') return;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekKey = weekStart.toISOString().slice(0, 10);
  const stored = readStoredValue<{ week: string; count: number } | null>('litsey_weekly_visits', null);
  if (stored?.week !== weekKey) {
    localStorage.setItem('litsey_weekly_visits', JSON.stringify({ week: weekKey, count: 1 }));
  }

  let visitorKey = localStorage.getItem('litsey_visitor_key');
  if (!visitorKey) {
    visitorKey = createStoredId();
    localStorage.setItem('litsey_visitor_key', visitorKey);
  }
  const visitMarker = `${weekKey}:${visitorKey}`;
  if (lastVisitSubmission === visitMarker) return;
  lastVisitSubmission = visitMarker;
  fetch('/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorKey }),
    keepalive: true,
  }).catch(() => {
    if (lastVisitSubmission === visitMarker) lastVisitSubmission = '';
  });
}

export function createStoredId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
