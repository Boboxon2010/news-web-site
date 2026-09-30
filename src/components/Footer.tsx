'use client';

import { useSiteSettings } from '@/hooks/useSiteSettings';
import ContactAction from '@/components/ContactAction';

export default function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800 py-10 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-extrabold text-amber-400 text-base mb-3">📍 Manzilimiz</h4>
          <p className="text-slate-300 leading-relaxed">{settings.address}</p>
          {settings.postalCode && <p className="text-xs text-slate-400 mt-2 font-mono">Pochta indeksi: {settings.postalCode}</p>}
        </div>

        <div>
          <h4 className="font-extrabold text-amber-400 text-base mb-3">📞 Bog'lanish</h4>
          {settings.phone && <p className="text-slate-300">Telefon: <span className="font-semibold text-white"><ContactAction kind="phone" value={settings.phone} /></span></p>}
          {settings.email && <p className="text-slate-300 mt-1">Elektron pochta: <span className="font-semibold text-white"><ContactAction kind="email" value={settings.email} /></span></p>}
        </div>

        <div>
          <h4 className="font-extrabold text-amber-400 text-base mb-3">⏰ Ish Rejimi</h4>
          {settings.workingHours && <p className="text-slate-300">{settings.workingHours}</p>}
          <p className="text-xs text-slate-400 mt-3">
            © {new Date().getFullYear()} O'zbekiston Respublikasi Ichki ishlar vazirligi Xorazm akademik litseyi. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
