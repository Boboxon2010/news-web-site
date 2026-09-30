// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ContactAction from '@/components/ContactAction';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = useSiteSettings();

  return (
    <footer className="bg-slate-950 text-slate-300 font-sans border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
        
        {/* 1-Ustun: Litsey haqida va Logo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-950 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-xs">
              IIV
            </div>
            <div>
              <h3 className="text-white font-extrabold text-base leading-tight">
                IIV Xorazm Akademik Litseyi
              </h3>
              <p className="text-xs text-amber-500 font-semibold">
                Rasmiy ta'lim portali
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kelajak posbonlari va soha mutaxassislarini tayyorlovchi zamonaviy akademik litsey.
          </p>
          <div className="text-xs text-slate-400 space-y-1">
            <p><strong className="text-slate-200">Manzil:</strong> {settings.address || 'Xorazm viloyati, Urganch shahri'}</p>
            {settings.email && <p><strong className="text-slate-200">Elektron pochta:</strong> <ContactAction kind="email" value={settings.email} /></p>}
          </div>
        </div>

        {/* 2-Ustun: Tezkor Navigatsiya */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
            Tezkor havolalar
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/about" className="hover:text-amber-400 transition-colors">Litsey tarixi</Link>
            </li>
            <li>
              <Link href="/about#rahbariyat" className="hover:text-amber-400 transition-colors">Rahbariyat</Link>
            </li>
            <li>
              <Link href="/admissions" className="hover:text-amber-400 transition-colors">Qabul shartlari - 2026</Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-amber-400 transition-colors">Yangiliklar va E'lonlar</Link>
            </li>
          </ul>
        </div>

        {/* 3-Ustun: Davlat resurslari */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
            Rasmiy Resurslar
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a href="https://iiv.uz" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                O'zbekiston Respublikasi IIV
              </a>
            </li>
            <li>
              <a href="https://gov.uz" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                O'zbekiston Hukumati Portali
              </a>
            </li>
            <li>
              <a href="https://my.gov.uz" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                Yagona Interaktiv Davlat Xizmatlari Portali
              </a>
            </li>
            <li>
              <a href="https://edu.uz" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
                Oliy ta'lim, fan va innovatsiyalar vazirligi
              </a>
            </li>
          </ul>
        </div>

        {/* 4-Ustun: Aloqa */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider border-l-2 border-amber-500 pl-2">Bog'lanish</h4>
          {settings.phone && <p className="text-sm text-slate-300">Telefon: <ContactAction kind="phone" value={settings.phone} /></p>}
          {settings.email && <p className="text-sm text-slate-300">Elektron pochta: <ContactAction kind="email" value={settings.email} /></p>}
          {settings.workingHours && <p className="text-sm text-slate-300">Ish vaqti: {settings.workingHours}</p>}
        </div>

      </div>

      {/* Mualliflik va Huquqlar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>© {currentYear} IIV Xorazm Akademik Litseyi. Barcha huquqlar himoyalangan.</p>
        <p className="text-[11px]">
          Sayt materiallaridan foydalanilganda manba ko'rsatilishi shart.
        </p>
      </div>
    </footer>
  );
}