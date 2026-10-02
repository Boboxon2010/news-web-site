'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ContactAction from '@/components/ContactAction';
import AddressLink from '@/components/AddressLink';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const settings = useSiteSettings();

  return (
    <header className="w-full sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Header Bar */}
      <div className="bg-blue-950 dark:bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span>📍 <AddressLink address={settings.address || 'Xorazm viloyati, Urganch shahri'} className="hover:text-amber-400" /></span>
            {settings.phone && <span className="hidden md:inline">📞 <ContactAction kind="phone" value={settings.phone} /></span>}
            {settings.email && <span className="hidden md:inline">✉️ <ContactAction kind="email" value={settings.email} /></span>}
          </div>

          {/* Quyosh / Oy Tungi-Kunduzgi Rejim Tugmasi */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-amber-400 px-3 py-1 rounded-full border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              title={theme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
            >
              {theme === 'light' ? (
                <>
                  <span className="text-sm">🌙</span>
                  <span className="hidden xs:inline">Tungi rejim</span>
                </>
              ) : (
                <>
                  <span className="text-sm">☀️</span>
                  <span className="hidden xs:inline">Kunduzgi rejim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 flex-shrink-0">
            <Image
              src="/images/IIV_logo.png"
              alt="Ichki Ishlar Vazirligi Logotipi"
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-wide block leading-tight text-white group-hover:text-amber-400 transition-colors">
              ICHKI ISHLAR VAZIRLIGI XORAZM AKADEMIK LITSEYI
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider block">
              Rasmiy Axborot va Yangiliklar Portali
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden xl:flex items-center gap-4 text-xs font-medium 2xl:gap-6 2xl:text-sm">
          <Link href="/" className="hover:text-amber-400 transition-colors">Bosh sahifa</Link>
          <Link href="/about" className="hover:text-amber-400 transition-colors">Biz haqimizda</Link>
          <Link href="/news" className="hover:text-amber-400 transition-colors">Yangiliklar</Link>
          <Link href="/admissions" className="hover:text-amber-400 transition-colors">Qabul</Link>
          <Link href="/gallery" className="hover:text-amber-400 transition-colors">Galereya</Link>
          <Link href="/contact" className="hover:text-amber-400 transition-colors">Aloqa</Link>
        </nav>

        {/* Mobile Toggle Button */}
        <button type="button" aria-label={isOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="xl:hidden p-2 text-slate-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 text-sm">
          <Link href="/" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Bosh sahifa</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Biz haqimizda</Link>
          <Link href="/news" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Yangiliklar</Link>
          <Link href="/admissions" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Qabul</Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Galereya</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block py-2 text-slate-200 hover:text-amber-400">Aloqa</Link>
        </div>
      )}
    </header>
  );
}
