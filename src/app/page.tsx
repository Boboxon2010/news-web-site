'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageGalleryViewer from '@/components/ImageGalleryViewer';
import NewsCardCarousel from '@/components/NewsCardCarousel';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getLatestNews, getStoredNews, NewsItem } from '@/lib/dataStore';

export default function HomePage() {
  const settings = useSiteSettings();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const updateNews = (refresh = false) => {
      if (refresh) setNews(getStoredNews());
      void getLatestNews(refresh).then(setNews);
    };
    void updateNews();
    const refreshNews = () => updateNews(true);
    window.addEventListener('datastore-update', refreshNews);
    window.addEventListener('storage', refreshNews);
    return () => {
      window.removeEventListener('datastore-update', refreshNews);
      window.removeEventListener('storage', refreshNews);
    };
  }, []);

  useEffect(() => {
    if (!selectedNews) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('[aria-label$="galereyasi"]')) {
        setSelectedNews(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [selectedNews]);

  const handleOpenGallery = (images?: string[]) => {
    if (images && images.length > 0) {
      setSelectedGallery(images);
      setIsGalleryOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-[5rem_minmax(0,1fr)_5rem] sm:grid-cols-[7rem_minmax(0,1fr)_7rem] lg:grid-cols-[10rem_minmax(0,1fr)_10rem] items-center gap-3 sm:gap-6 lg:gap-10">
          <div className="relative mx-auto aspect-square w-full">
            <Image src="/images/gerb.webp" alt="O‘zbekiston Respublikasi Davlat gerbi" fill priority unoptimized className="object-contain" />
          </div>
          <div className="space-y-4">
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight">
              {settings.heroTitle || "O'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi"}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto">
              {settings.heroSubtitle || "Vatanparvar va fidoyi yoshlarni tarbiyalash maskani"}
            </p>
            {settings.badgeText && (
              <p className="inline-flex border border-amber-400/50 px-3 py-1 text-[10px] sm:text-xs font-semibold text-amber-300">
                {settings.badgeText}
              </p>
            )}
          </div>
          <div className="relative mx-auto aspect-square w-full">
            <Image src="/images/IIV_logo_trimmed.png" alt="Ichki ishlar vazirligi logotipi" fill priority unoptimized className="object-contain" />
          </div>
        </div>
      </section>

      {/* Yangiliklar va E'lonlar */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-l-4 border-amber-500 pl-3">
          So'nggi Yangiliklar va E'lonlar
        </h2>

        {news.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            Hozircha yangiliklar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => {
              const imagesList = item.images || [];
              const hasImages = imagesList.length > 0;

              return (
                <article key={item.id} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedNews(item)}
                    aria-label={`Yangilikni to‘liq ochish: ${item.title}`}
                    className="absolute inset-0 z-0 rounded-2xl"
                  />
                  <div className="relative z-10 pointer-events-none">
                    {hasImages && <NewsCardCarousel images={imagesList} title={item.title} onOpenNews={() => setSelectedNews(item)} />}

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                      {item.shortDesc}
                    </p>
                  </div>

                  {hasImages && (
                    <button
                      type="button"
                      onClick={() => handleOpenGallery(imagesList)}
                      className="relative z-10 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                    >
                      Rasmlarni ko'rish ({imagesList.length})
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedNews && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Yangilik: ${selectedNews.title}`}
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedNews(null); }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
        >
          <header className="sticky top-0 z-30 shrink-0 border-b border-slate-800 bg-slate-950 text-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-amber-500/60 text-xs font-black text-amber-400">IIV</span>
                <div>
                  <p className="text-xs font-bold uppercase text-white">Xorazm akademik litseyi</p>
                  <p className="text-[10px] text-slate-400">Yangilik va e’lon</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedNews(null)} aria-label="Yangilikni yopish" title="Yopish (Esc)" className="flex h-10 w-10 items-center justify-center border border-slate-700 text-lg text-slate-300 transition-colors hover:border-amber-400 hover:text-white">×</button>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-8 px-4 py-7 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <article className="min-w-0 space-y-8" onClick={(event) => event.stopPropagation()}>
              <header className="space-y-4 border-b border-slate-300 pb-7 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
                  <span className="border-l-2 border-amber-500 pl-2 uppercase tracking-wide text-amber-700 dark:text-amber-400">{selectedNews.category}</span>
                  <span className="text-slate-500 dark:text-slate-400">{selectedNews.date}</span>
                </div>
                <h1 className="max-w-4xl text-3xl font-black leading-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">{selectedNews.title}</h1>
                {selectedNews.shortDesc && <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">{selectedNews.shortDesc}</p>}
              </header>

              {selectedNews.images?.length ? (
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fotolavhalar</h2>
                  <ImageGalleryViewer images={selectedNews.images} altTitle={selectedNews.title} />
                </section>
              ) : null}

              <section className="max-w-4xl border-l-2 border-amber-500 pl-5 sm:pl-7">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Maqola</h2>
                <div
                  className="prose prose-slate max-w-none text-base leading-8 dark:prose-invert [&_a]:font-semibold [&_a]:text-amber-700 [&_a]:underline dark:[&_a]:text-amber-400 [&_img]:max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: selectedNews.fullContent.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" '),
                  }}
                />
              </section>
            </article>

            <aside className="h-fit space-y-6 border-t border-slate-300 pt-5 dark:border-slate-800 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bo‘lim</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedNews.category}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sana</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedNews.date}</p>
              </div>
              {selectedNews.files?.length ? (
                <section className="space-y-3 border-t border-slate-300 pt-5 dark:border-slate-800">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">Biriktirilgan hujjatlar</h2>
                  {selectedNews.files.map((file) => (
                    <a key={file.id} href={file.dataUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 transition-colors hover:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <span className="min-w-0 truncate">{file.name}</span>
                      <span aria-hidden="true" className="shrink-0 text-amber-600 dark:text-amber-400">↓</span>
                    </a>
                  ))}
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      )}

      {/* Galereya modali */}
      {isGalleryOpen && (
        <ImageGalleryViewer 
          images={selectedGallery}
          modalOnly
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </main>
  );
}
