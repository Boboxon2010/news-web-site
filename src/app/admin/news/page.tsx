'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredNews, saveStoredNews, NewsItem } from '@/lib/dataStore';

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const updateNews = async () => {
      try {
        const response = await fetch('/api/news', { cache: 'no-store' });
        if (response.ok) {
          const items = await response.json();
          setNews(Array.isArray(items) ? items : getStoredNews());
          return;
        }
      } catch {}
      setNews(getStoredNews());
    };
    void updateNews();
    window.addEventListener('datastore-update', updateNews);
    window.addEventListener('storage', updateNews);
    return () => {
      window.removeEventListener('datastore-update', updateNews);
      window.removeEventListener('storage', updateNews);
    };
  }, []);

  const deleteNews = async (id: string) => {
    if (!window.confirm("Ushbu yangilikni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const response = await fetch(`/api/news?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok && response.status < 500) throw new Error("Yangilikni o'chirib bo'lmadi.");
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') return;
    }
    const nextNews = news.filter((item) => item.id !== id);
    saveStoredNews(nextNews);
    setNews(nextNews);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Yangiliklar</h1>
        </div>
        <Link href="/admin/news/create" className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Yangi yangilik</Link>
      </header>

      {news.length === 0 ? (
        <p className="border-y border-slate-200 py-10 text-center text-sm text-slate-500">Hozircha yangilik qo'shilmagan.</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {news.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
              {item.images?.[0] && <img src={item.images[0]} alt="" className="h-20 w-28 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{item.category} · {item.date}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => router.push(`/admin/news/create?id=${encodeURIComponent(item.id)}`)} className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Tahrirlash</button>
                <button type="button" onClick={() => deleteNews(item.id)} className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">O'chirish</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
