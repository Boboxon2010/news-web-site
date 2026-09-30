'use client';

import { useEffect, useState } from 'react';
import ImageGalleryViewer from '@/components/ImageGalleryViewer';
import { getLatestNews, getStoredNews, NewsItem } from '@/lib/dataStore';

export default function GalleryPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    void getLatestNews().then(setNews);

    const refreshNews = () => {
      setNews(getStoredNews());
      void getLatestNews(true).then(setNews);
    };
    window.addEventListener('datastore-update', refreshNews);
    window.addEventListener('storage', refreshNews);
    return () => {
      window.removeEventListener('datastore-update', refreshNews);
      window.removeEventListener('storage', refreshNews);
    };
  }, []);

  const galleryItems = news.filter((item) => item.images?.length);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 font-sans dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider dark:text-amber-400">Litsey Hayoti</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Fotogalereya</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-lg mx-auto">
            IIV Xorazm Akademik Litseyida bo‘lib o‘tgan tadbirlar va o‘quv jarayonlaridan lavhalar
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <p className="border-y border-slate-200 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Galereya rasmlari hozircha joylanmagan.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setSelectedNews(item)}
                  aria-label={`${item.title} rasmlarini ochish`}
                  className="relative block h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.images && item.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-white">
                      {item.images.length} ta rasm
                    </span>
                  )}
                </button>
                <div className="space-y-1 p-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.date} · {item.category}</span>
                  <h2 className="font-semibold text-slate-900 dark:text-white">{item.title}</h2>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedNews?.images?.length ? (
        <ImageGalleryViewer
          images={selectedNews.images}
          altTitle={selectedNews.title}
          modalOnly
          onClose={() => setSelectedNews(null)}
        />
      ) : null}
    </main>
  );
}