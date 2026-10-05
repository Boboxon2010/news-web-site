'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getStoredLeaders, LeaderItem } from '@/lib/dataStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { sortLeaders } from '@/lib/leadershipSort';
import LoadingIndicator from '@/components/LoadingIndicator';

export default function AboutPage() {
  const settings = useSiteSettings();
  const [leaders, setLeaders] = useState<LeaderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderSearch, setLeaderSearch] = useState('');
  const [leaderSort, setLeaderSort] = useState<'name' | 'role'>('role');
  const aboutTitle = settings.aboutTitle.trim();
  const heroTitle = /^o['’‘]zbekiston\s+respublikasi\b/i.test(aboutTitle)
    ? aboutTitle
    : `O‘zbekiston Respublikasi ${aboutTitle}`;

  const loadData = () => {
    fetch('/api/leaders', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Leaders unavailable');
        const items = await response.json();
        setLeaders(items.length > 0 ? items : getStoredLeaders());
      })
      .catch(() => setLeaders(getStoredLeaders()))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const cachedLeaders = getStoredLeaders();
    if (cachedLeaders.length > 0) {
      setLeaders(cachedLeaders);
      setIsLoading(false);
    }
    loadData();
    window.addEventListener('storage_updated', loadData);
    return () => window.removeEventListener('storage_updated', loadData);
  }, []);

  const visibleLeaders = sortLeaders(
    leaders.filter((leader) => {
      const query = leaderSearch.trim().toLocaleLowerCase();
      return !query || `${leader.name} ${leader.role}`.toLocaleLowerCase().includes(query);
    }),
    leaderSort
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-16 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wider uppercase">Tashkilot Haqida</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">{heroTitle}</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
          {settings.aboutSubtitle}
        </p>
      </div>

      <section id="rahbariyat" className="scroll-mt-24 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Litsey Rahbariyati</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Rasmiy tasdiqlangan rahbar va komandir-o'qituvchilarimiz</p>
        </div>

        {isLoading ? (
          <LoadingIndicator />
        ) : leaders.length === 0 ? (
          <div className="bg-slate-900/5 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Rahbariyat ma'lumotlari admin tomonidan kiritilmoqda.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-end">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qidirish
                <input value={leaderSearch} onChange={(event) => setLeaderSearch(event.target.value)} placeholder="Ism, familiya yoki lavozim" className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Saralash
                <select value={leaderSort} onChange={(event) => setLeaderSort(event.target.value as 'name' | 'role')} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  <option value="name">Alifbo bo‘yicha</option>
                  <option value="role">Lavozim bo‘yicha</option>
                </select>
              </label>
            </div>

            {visibleLeaders.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Filtr bo‘yicha rahbariyat ma’lumoti topilmadi.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleLeaders.map((item) => {
              const hasPhoto = Boolean(item.photoUrl && item.photoUrl.trim() !== '');
              return (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-4">
                    {hasPhoto ? (
                      <Image
                        src={item.photoUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        quality={75}
                        loading="lazy"
                        unoptimized={item.photoUrl.startsWith('data:')}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0"
                      />
                    ) : null}
                    <div className="space-y-1">
                      <h3 className={`font-black text-slate-900 dark:text-white ${hasPhoto ? 'text-base' : 'text-xl text-amber-600 dark:text-amber-400'}`}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{item.role}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.spec}</p>
                    </div>
                  </div>
                </div>
              );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
