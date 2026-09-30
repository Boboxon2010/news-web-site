'use client';

import { useState, useEffect } from 'react';
import ImageGalleryViewer from '@/components/ImageGalleryViewer';
import { getLatestNews, getStoredNews, NewsItem } from '@/lib/dataStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function NewsPage() {
  const settings = useSiteSettings();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const fetchNews = (refresh = false) => {
    if (refresh) setNews(getStoredNews());
    void getLatestNews(refresh).then(setNews);
  };

  useEffect(() => {
    fetchNews();
    const refreshNews = () => fetchNews(true);
    window.addEventListener('datastore-update', refreshNews);
    window.addEventListener('storage', refreshNews);
    return () => {
      window.removeEventListener('datastore-update', refreshNews);
      window.removeEventListener('storage', refreshNews);
    };
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-12 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wider uppercase">Litsey Hayoti</span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{settings.newsTitle}</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
          {settings.newsSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <article
            key={item.id}
            onClick={() => setSelectedNews(item)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={item.images?.[0] || '/images/IIV_logo.png'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {item.category}
                </span>

                {item.images && item.images.length > 1 && (
                  <span className="absolute bottom-3 right-3 bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-md border border-slate-700">
                    🖼️ {item.images.length} ta rasm
                  </span>
                )}
              </div>

              <div className="p-6 space-y-3">
                <span className="text-[11px] text-slate-400 font-medium block">{item.date}</span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {item.shortDesc || item.fullContent.replace(/<[^>]*>?/gm, '')}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <span>Batafsil va Rasmlarni Ko'rish</span>
              <span>→</span>
            </div>
          </article>
        ))}
      </div>

      {/* BATAFSIL MODAL (SLIDER & ZOOM USKUNALARI VA LINKLAR) */}
      {selectedNews && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl w-full rounded-3xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-6 right-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>

            <div className="space-y-3 pr-8">
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase">
                {selectedNews.category}
              </span>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {selectedNews.title}
              </h2>
              <span className="text-xs text-slate-400 block">{selectedNews.date}</span>
            </div>

            {/* RASM GALEREYASI (SURISH VA ZOOM USKUNALARI) */}
            {selectedNews.images && selectedNews.images.length > 0 && (
              <ImageGalleryViewer images={selectedNews.images} altTitle={selectedNews.title} />
            )}

            {/* FORMATLANGAN HTML MATN VA LINKLAR */}
            <div
              className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 prose dark:prose-invert max-w-none [&_a]:text-amber-500 [&_a]:font-bold [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: selectedNews.fullContent.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
              }}
            />

            {/* BIRIKTIRILGAN HUJJAT FAYLLARI */}
            {selectedNews.files && selectedNews.files.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Biriktirilgan Hujjatlar:</h4>
                <div className="flex flex-col gap-2">
                  {selectedNews.files.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 hover:border-amber-400 transition-all"
                    >
                      <span className="font-semibold">📄 {file.name}</span>
                      <span className="text-amber-500 font-bold">Yuklab olish ⬇</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}
