// src/components/news/NewsCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { NewsItem } from '@/types';

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Rasm qismi - Next.js Image orqali avtomatik optimizatsiya qilinadi */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <Image
            src={news.coverImage}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={false}
          />
          <span className="absolute top-3 left-3 bg-blue-900/90 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
            {news.category}
          </span>
        </div>

        {/* Matn qismi */}
        <div className="p-5">
          <div className="flex items-center text-xs text-slate-500 gap-2 mb-2">
            <span>{news.publishedAt}</span>
            <span>•</span>
            <span>{news.author.fullName}</span>
          </div>

          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 mb-2">
            {news.title}
          </h3>

          <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
            {news.summary}
          </p>
        </div>
      </div>

      {/* Havola */}
      <div className="p-5 pt-0">
        <Link
          href={`/news/${news.slug}`}
          className="inline-flex items-center text-sm font-semibold text-blue-900 hover:text-amber-600 transition-colors gap-1 group/btn"
        >
          Batafsil o'qish
          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </article>
  );
}