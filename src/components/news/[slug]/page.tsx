// src/app/news/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';

interface SingleNewsPageProps {
  params: {
    slug: string;
  };
}

export default function SingleNewsPage({ params }: SingleNewsPageProps) {
  // Real loyihada ushbu ma'lumot FastAPI backend'dan fetch qilinadi
  const mockNews = {
    title: "Akademik litseyda 'Ochiq eshiklar kuni' bo'lib o'tdi",
    category: "Tadbir",
    publishedAt: "25-Sentabr, 2026",
    views: 1420,
    author: "Axborot xizmati",
    coverImage: "/images/sample-news-1.jpg",
    content: `
      O'zbekiston Respublikasi IIV Xorazm Akademik litseyida bo'lajak abituriyentlar va ularning ota-onalari uchun 'Ochiq eshiklar kuni' tashkil etildi.
      
      Tadbir davomida tashrif buyurgan mehmonlarga litseyning moddiy-texnik bazasi, zamonaviy axborot texnologiyalari xonalari, sport majmuasi hamda harbiy-vatanparvarlik mashg'ulot maydonchalari ko'rsatib o'tildi.
      
      Litsey direktori kirish so'zi bilan chiqish qilib, 2026-2027 o'quv yili uchun qabul tartiblari va imtihon bosqichlari haqida batafsil ma'lumot berdi.
    `,
    gallery: [
      "/images/gallery-1.jpg",
      "/images/gallery-2.jpg"
    ]
  };

  return (
    <article className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Orqaga qaytish havolasi */}
        <Link
          href="/news"
          className="inline-flex items-center text-xs font-semibold text-blue-900 hover:text-amber-600 transition-colors gap-1.5"
        >
          ← Barcha yangiliklarga qaytish
        </Link>

        {/* Sarlavha va Metadata */}
        <header className="space-y-4">
          <span className="inline-block bg-blue-950 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            {mockNews.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            {mockNews.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-xs text-slate-500 gap-4 pt-2 border-b border-slate-200 pb-4">
            <span>📅 {mockNews.publishedAt}</span>
            <span>✍️ Muallif: {mockNews.author}</span>
            <span>👁️ {mockNews.views} marta ko'rildi</span>
          </div>
        </header>

        {/* Asosiy Rasm */}
        <div className="relative h-[350px] md:h-[480px] w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <Image
            src={mockNews.coverImage}
            alt={mockNews.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Yangilik Matni */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 text-slate-800 leading-relaxed text-base space-y-6">
          {mockNews.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))}
        </div>

        {/* Fotogalereya (Agar rasmlar bo'lsa) */}
        {mockNews.gallery.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Tadbirdan fotolavhalar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockNews.gallery.map((imgUrl, i) => (
                <div key={i} className="relative h-60 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <Image src={imgUrl} alt={`Foto ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
}