'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pathname.includes('/admin/login')) {
      setIsLoading(false);
      return;
    }

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Unauthorized');
        setIsAuth(true);
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setIsLoading(false));
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  if (!isAuth) return null;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 text-white text-xl font-black border-b border-slate-800 tracking-wider">
          <span className="text-blue-500">IIV</span> ADMIN
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            {[
              { name: 'Dashboard (Statistika)', path: '/admin', icon: '📊' },
              { name: 'Yangiliklar', path: '/admin/news', icon: '📰' },
              { name: 'Rahbariyat', path: '/admin/leaders', icon: '👥' },
              { name: 'Murojaatlar', path: '/admin/messages', icon: '✉️' },
              { name: 'Sozlamalar', path: '/admin/settings', icon: '⚙️' }
            ].map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path} className={`flex items-center gap-3 px-6 py-3 font-medium transition-all ${isActive ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' : 'hover:bg-slate-800 hover:text-white'}`}>
                    <span>{item.icon}</span> {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh(); }} className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold text-sm flex items-center justify-center gap-2">
            🚪 Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
