'use client';

import { useEffect, useState } from 'react';

interface ContactActionProps {
  kind: 'phone' | 'email';
  value: string;
  className?: string;
}

export default function ContactAction({ kind, value, className = '' }: ContactActionProps) {
  const [isTouch, setIsTouch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneHref = `tel:${value.replace(/[^\d+]/g, '')}`;

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  if (kind === 'email') {
    return <a className={className} href={`mailto:${value}`}>{value}</a>;
  }

  if (isTouch) {
    return <a className={className} href={phoneHref}>{value}</a>;
  }

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="relative inline-flex">
      <button type="button" className={className} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {value}
      </button>
      {menuOpen && (
        <span role="menu" className="absolute left-0 top-full z-50 mt-2 min-w-44 rounded-md border border-slate-200 bg-white p-1.5 text-sm text-slate-800 shadow-lg">
          <button type="button" role="menuitem" onClick={copyPhone} className="block w-full rounded px-3 py-2 text-left hover:bg-slate-100">
            {copied ? 'Nusxalandi' : 'Raqamni nusxalash'}
          </button>
          <a role="menuitem" href={phoneHref} className="block rounded px-3 py-2 hover:bg-slate-100">Qo‘ng‘iroq qilish</a>
        </span>
      )}
    </span>
  );
}
