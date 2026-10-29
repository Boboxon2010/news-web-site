'use client';

import { useState, useEffect, useMemo } from 'react';
import ImageGalleryViewer from '@/components/ImageGalleryViewer';
import NewsMediaCarousel from '@/components/NewsMediaCarousel';
import NewsVideo from '@/components/NewsVideo';
import { getLatestNews, getStoredNews, getNewsCoverImage, NewsItem } from '@/lib/dataStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const NEWS_PER_PAGE = 15;

function getNewsTimestamp(dateValue: string): number {
  const value = dateValue.trim();
  const isoDateMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  const dayFirstMatch = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) return timestamp;

  return 0;
}

export default function NewsPage() {
  const settings = useSiteSettings();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

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

  const categories = useMemo(
    () => Array.from(new Set(news.map((item) => item.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [news],
  );

  const filteredNews = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const startTimestamp = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTimestamp = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;
    const uniqueNews = new Map<string, NewsItem>();

    news.forEach((item) => {
      if (!uniqueNews.has(item.id)) uniqueNews.set(item.id, item);
    });

    return Array.from(uniqueNews.values())
      .filter((item) => {
        const searchableText = `${item.title} ${item.shortDesc} ${item.fullContent} ${item.category}`.toLocaleLowerCase();
        const timestamp = getNewsTimestamp(item.date);
        return (
          (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
          (!category || item.category === category) &&
          (startTimestamp === null || (timestamp > 0 && timestamp >= startTimestamp)) &&
          (endTimestamp === null || (timestamp > 0 && timestamp <= endTimestamp))
        );
      })
      .sort((a, b) => {
        const dateDifference = getNewsTimestamp(b.date) - getNewsTimestamp(a.date);
        return dateDifference || Number(b.id) - Number(a.id) || b.id.localeCompare(a.id);
      });
  }, [category, endDate, news, search, startDate]);

  const pageCount = Math.max(1, Math.ceil(filteredNews.length / NEWS_PER_PAGE));
  const visibleNews = filteredNews.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
  }, [category, endDate, search, startDate]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-12 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wider uppercase">Litsey Hayoti</span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{settings.newsTitle}</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
          {settings.newsSubtitle}
        </p>
      </div>

      <section aria-label="Yangiliklarni qidirish va filtrlash" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Qidirish
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Sarlavha yoki matn..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-amber-500"
          />
        </label>
        <label className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Kategoriya
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-amber-500"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Boshlanish sanasi
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-amber-500"
          />
        </label>
        <label className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Tugash sanasi
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-amber-500"
          />
        </label>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleNews.map((item) => (
          <article
            key={item.id}
            onClick={() => setSelectedNews(item)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {(item.images?.length || item.videos?.length) ? (
                  <NewsMediaCarousel images={item.images} videos={item.videos} title={item.title} className="mb-0 h-48 w-full rounded-none" />
                ) : (
                  <img src={getNewsCoverImage(item.images)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
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

      {visibleNews.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Tanlangan mezonlarga mos yangilik topilmadi.</p>
      )}

      {filteredNews.length > NEWS_PER_PAGE && (
        <nav aria-label="Yangiliklar sahifalari" className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Oldingi
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-xl px-3 text-sm font-bold ${pageNumber === page ? 'bg-amber-500 text-slate-950' : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            disabled={page === pageCount}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Keyingi
          </button>
        </nav>
      )}

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

            {selectedNews.videos?.length ? (
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Videolar:</h4>
                {selectedNews.videos.map((video) => <NewsVideo key={video.id} src={video.dataUrl} title={selectedNews.title} detail className="max-h-[70vh] w-full rounded-xl" />)}
              </div>
            ) : null}

            {/* FORMATLANGAN HTML MATN VA LINKLAR */}
            <div
              className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 prose dark:prose-invert max-w-none [&_a]:text-amber-500 [&_a]:font-bold [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(selectedNews.fullContent)
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
