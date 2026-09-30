'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredNews, getAdminProfile, getWeeklyVisitCount, NewsItem, AdminProfile } from '@/lib/dataStore';

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('/api/news', { cache: 'no-store' });
        if (response.ok) {
          const items = await response.json();
          setNews(Array.isArray(items) ? items : getStoredNews());
          return;
        }
      } catch {}
      setNews(getStoredNews());
    };
    void loadNews();
    setProfile(getAdminProfile());
    setVisits(getWeeklyVisitCount());
    const updateDashboard = () => {
      setNews(getStoredNews());
      setVisits(getWeeklyVisitCount());
      fetch('/api/stats', { cache: 'no-store' })
        .then(async (response) => {
          if (response.ok) setVisits((await response.json()).weeklyVisits);
        })
        .catch(() => undefined);
    };
    updateDashboard();
    window.addEventListener('datastore-update', updateDashboard);
    window.addEventListener('storage', updateDashboard);
    return () => {
      window.removeEventListener('datastore-update', updateDashboard);
      window.removeEventListener('storage', updateDashboard);
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xush kelibsiz, {profile?.username || 'Admin'} 👋</h1>
          <p className="text-slate-500 mt-1">Sayt holati va so'nggi ma'lumotlar bilan tanishing.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm font-semibold text-slate-600">Bugungi sana</div>
          <div className="text-lg font-bold text-blue-600">{new Date().toLocaleDateString('uz-UZ')}</div>
        </div>
      </div>

      {/* Statistika kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl text-2xl">📰</div>
          <div>
            <div className="text-3xl font-black text-slate-900">{news.length}</div>
            <div className="text-sm text-slate-500 font-medium">Jami yangiliklar</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl text-2xl">👁️</div>
          <div>
            <div className="text-3xl font-black text-slate-900">{visits.toLocaleString('uz-UZ')}</div>
            <div className="text-sm text-slate-500 font-medium">Haftalik noyob tashriflar</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl text-2xl">🛡️</div>
          <div>
            <div className="text-3xl font-black text-slate-900">Faol</div>
            <div className="text-sm text-slate-500 font-medium">Tizim holati</div>
          </div>
        </div>
      </div>

      {/* Tezkor harakatlar va Ma'lumot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">⚡ Tezkor harakatlar</h2>
          <div className="space-y-3">
            <Link href="/admin/news/create" className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-slate-700 flex justify-between items-center">
              Yangi xabar qo'shish <span>+</span>
            </Link>
            <Link href="/admin/settings" className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-slate-700 flex justify-between items-center">
              Sayt sozlamalarini tahrirlash <span>⚙️</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">📌 Tizim haqida</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex justify-between"><span>Tizim versiyasi:</span> <span className="font-mono bg-slate-100 px-2 rounded">v2.0 MVP</span></li>
            <li className="flex justify-between"><span>Foydalanuvchi huquqi:</span> <span className="text-green-600 font-bold">Super Admin</span></li>
            <li className="flex justify-between"><span>Xavfsizlik:</span> <span>HttpOnly JWT / HMAC-SHA256</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
