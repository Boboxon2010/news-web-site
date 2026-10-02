'use client';

import { useState, useEffect } from 'react';
import { getStoredLeaders, LeaderItem } from '@/lib/dataStore';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const leadershipRoleOrder = [
  'Direktor',
  'OʻIB direktor oʻrinbosari',
  'MM va TIB direktor oʻrinbosari',
  'M va XTB direktor oʻrinbosari',
  'Oʻquv kursi komandiri',
  'Kafedra boshligʻi',
  'Bosh mutaxassis',
  'Yoshlar yetakchisi',
  'Oʻquv boʻlim mudiri',
  'Oʻquv boʻlim uslubchisi',
  'Toʻgarak rahbari',
  'Yuriskonsult',
  'Psixolog',
  'Katta inspektor',
  'Bosh buxgalter',
  'Buxgalter',
  'Tibbiy xamshira',
  'Kanselyariya ish yurituvchisi',
  'Arm rahbari',
  'Kutubxonachi',
  'Ona tili va adabiyot fani oʻqituvchisi',
  'Rus tili fani oʻqituvchisi',
  'Ingliz tili fani oʻqituvchisi',
  'Fransuz tili fani oʻqituvchisi',
  'Nemis tili fani oʻqituvchisi',
  'Tarix fani oʻqituvchisi',
  'Matematika fani oʻqituvchisi',
  'Fizika fani oʻqituvchisi',
  'Huquq fani oʻqituvchisi',
  'Kasbiy fan',
  'Informatika',
  'Biologiya fani oʻqituvchisi',
  'Jismoniy tarbiya oʻqituvchisi',
  'Ombor mudiri',
  'Komendant',
  'Yotoqxona navbatchisi',
  'Avtobus xaydovchi',
  'Haydovchi',
  'Qorovul',
  'Duradgor',
  'Elektromonter',
  'Xovli supuruvchi',
  'Farrosh',
  'Chilangar-santexnik',
];

function normalizeLeadershipRole(role: string): string {
  const cyrillicToLatin: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
    и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', ў: 'o', п: 'p',
    р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'shch', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };

  return role.normalize('NFKC').toLocaleLowerCase('uz-UZ')
    .replace(/[а-яёөүғқҳцчшщъыьэюя]/g, (letter) => cyrillicToLatin[letter] ?? letter)
    .replace(/[ʻ’‘ʼ`']/g, '')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const leadershipRoleRanks = new Map<string, number>(
  leadershipRoleOrder.map((role, index) => [normalizeLeadershipRole(role), index] as const)
);

const leadershipRoleAliases = new Map<string, string>([
  ['Oʻquv ishlari boʻyicha direktor oʻrinbosari', 'OʻIB direktor oʻrinbosari'],
  ['Maʼnaviyat-maʼrifat va tarbiyaviy ishlar boʻyicha direktor oʻrinbosari', 'MM va TIB direktor oʻrinbosari'],
  ['Maʼnaviyat va xoʻjalik ishlari boʻyicha direktor oʻrinbosari', 'M va XTB direktor oʻrinbosari'],
  ['Oʻquv kurs komandiri', 'Oʻquv kursi komandiri'],
  ['ARM raxbari', 'Arm rahbari'],
  ['Bosh bugalter', 'Bosh buxgalter'],
  ['Bugalter', 'Buxgalter'],
  ['Oʻquv boʻlimi mudiri', 'Oʻquv boʻlim mudiri'],
  ['Tibbiy hamshira', 'Tibbiy xamshira'],
  ['Toʻgarak raxbari', 'Toʻgarak rahbari'],
  ['Fransuz tili oʻqituvchisi', 'Fransuz tili fani oʻqituvchisi'],
  ['Informatika fani oʻqituvchisi', 'Informatika'],
  ['Avtobus haydovchi', 'Avtobus xaydovchi'],
  ['Hovli supuruvchi', 'Xovli supuruvchi'],
  ['Қоравул', 'Qorovul'],
].map(([role, canonicalRole]) => [normalizeLeadershipRole(role), normalizeLeadershipRole(canonicalRole)] as const));

function getLeadershipRoleRank(role: string): number {
  const normalizedRole = normalizeLeadershipRole(role);
  const canonicalRole = leadershipRoleAliases.get(normalizedRole) ?? normalizedRole;
  return leadershipRoleRanks.get(canonicalRole) ?? leadershipRoleOrder.length;
}

export default function AboutPage() {
  const settings = useSiteSettings();
  const [leaders, setLeaders] = useState<LeaderItem[]>([]);
  const [leaderSearch, setLeaderSearch] = useState('');
  const [leaderSort, setLeaderSort] = useState<'name' | 'role'>('name');
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
      .catch(() => setLeaders(getStoredLeaders()));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage_updated', loadData);
    return () => window.removeEventListener('storage_updated', loadData);
  }, []);

  const visibleLeaders = leaders
    .filter((leader) => {
      const query = leaderSearch.trim().toLocaleLowerCase();
      return !query || `${leader.name} ${leader.role}`.toLocaleLowerCase().includes(query);
    })
    .sort((first, second) => {
      const primaryOrder = leaderSort === 'name'
        ? first.name.localeCompare(second.name, 'uz-UZ')
        : getLeadershipRoleRank(first.role) - getLeadershipRoleRank(second.role) || first.role.localeCompare(second.role, 'uz-UZ');
      return primaryOrder || first.name.localeCompare(second.name, 'uz-UZ');
    });

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

        {leaders.length === 0 ? (
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
                      <img
                        src={item.photoUrl}
                        alt={item.name}
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
