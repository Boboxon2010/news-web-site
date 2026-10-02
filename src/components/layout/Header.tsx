// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import IivLogo from '@/components/ui/IivLogo';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ContactAction from '@/components/ContactAction';
import AddressLink from '@/components/AddressLink';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const settings = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="w-full font-sans sticky top-0 z-50 bg-white transition-all">
      {/* 1. YUQORI MA'LUMOTLAR SATRI */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {settings.phone && <span className="flex items-center gap-1.5"><span className="text-amber-400 font-bold">📞 Telefon:</span><ContactAction kind="phone" value={settings.phone} className="hover:text-amber-400 transition-colors" /></span>}
            {settings.email && <ContactAction kind="email" value={settings.email} className="hover:text-amber-400 transition-colors" />}
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-400">
              📍 <AddressLink address={settings.address || 'Xorazm viloyati, Urganch shahri'} className="hover:text-amber-400 transition-colors" />
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Telegram</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Instagram</a>
            <span className="text-slate-700">|</span>
            <span className="text-amber-400 font-bold">O'ZB</span>
          </div>
        </div>
      </div>

      {/* 2. LOGOTIP VA TEZKOR HARAKATLAR */}
      <div className={`bg-white py-3 border-b border-slate-100 transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <IivLogo size="md" />
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admissions"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-blue-950 bg-amber-400 hover:bg-amber-500 transition-all shadow-sm"
            >
              Qabul - 2026/2027
            </Link>
            <Link
              href="/admin/login"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-950 hover:bg-slate-900 transition-all shadow-sm"
            >
              Tizimga kirish
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* 3. NAVIGATSIYA MENYUSI */}
      <nav className="bg-blue-950 text-white hidden lg:block border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <ul className="flex items-center space-x-1 font-semibold text-xs">
            <li>
              <Link href="/" className="inline-block py-3.5 px-4 text-amber-400 hover:bg-blue-900 transition-colors border-b-2 border-amber-400">
                Bosh sahifa
              </Link>
            </li>
            <li>
              <Link href="/about" className="inline-block py-3.5 px-4 text-slate-200 hover:text-white hover:bg-blue-900 transition-colors">
                Litsey haqida
              </Link>
            </li>
            <li>
              <Link href="/news" className="inline-block py-3.5 px-4 text-slate-200 hover:text-white hover:bg-blue-900 transition-colors">
                Yangiliklar va E'lonlar
              </Link>
            </li>
            <li>
              <Link href="/admissions" className="inline-block py-3.5 px-4 text-amber-400 hover:bg-blue-900 transition-colors">
                Qabul komissiyasi
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="inline-block py-3.5 px-4 text-slate-200 hover:text-white hover:bg-blue-900 transition-colors">
                Fotogalereya
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-block py-3.5 px-4 text-slate-200 hover:text-white hover:bg-blue-900 transition-colors">
                Bog'lanish va Manzil
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. MOBIL MENYU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-blue-950 text-white p-4 space-y-3 border-t border-blue-900">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg bg-blue-900 text-amber-400 font-bold text-xs">
            Bosh sahifa
          </Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 text-xs text-slate-200">
            Litsey haqida
          </Link>
          <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 text-xs text-slate-200">
            Yangiliklar
          </Link>
          <Link href="/admissions" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 text-xs text-amber-400 font-bold">
            Qabul komissiyasi
          </Link>
          <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 text-xs text-slate-200">
            Fotogalereya
          </Link>
          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 px-3 text-xs text-slate-200">
            Bog'lanish
          </Link>
        </div>
      )}
    </header>
  );
}