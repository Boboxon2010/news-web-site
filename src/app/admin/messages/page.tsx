'use client';

import { useEffect, useState } from 'react';
import ContactAction from '@/components/ContactAction';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/contact', { cache: 'no-store' });
      if (!response.ok) throw new Error('Murojaatlarni yuklab bo‘lmadi.');
      setMessages(await response.json());
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Server bilan bog‘lanishda xatolik.');
    }
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  const markRead = async (id: string) => {
    const response = await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (response.ok) setMessages((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
  };

  const remove = async (id: string) => {
    if (!window.confirm("Murojaatni o'chirishni tasdiqlaysizmi?")) return;
    const response = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (response.ok) setMessages((items) => items.filter((item) => item.id !== id));
    else setError("Murojaatni o'chirib bo'lmadi.");
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Onlayn murojaatlar</h1>
        </div>
        <p className="text-sm text-slate-500">Jami: {messages.length} · O'qilmagan: {messages.filter((item) => !item.isRead).length}</p>
      </header>

      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {messages.length === 0 && !error && <p className="border-y border-slate-200 py-12 text-center text-sm text-slate-500">Hozircha murojaatlar yo'q.</p>}

      <div className="divide-y divide-slate-200">
        {messages.map((item) => (
          <article key={item.id} className={`space-y-3 py-5 ${item.isRead ? '' : 'border-l-2 border-amber-500 pl-4'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{item.name} {!item.isRead && <span className="ml-2 text-xs font-medium text-amber-700">Yangi</span>}</h2>
                <p className="mt-1 text-xs text-slate-500">{item.createdAt}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {item.phone && <span>Tel: <ContactAction kind="phone" value={item.phone} className="font-medium text-blue-800 underline" /></span>}
                {item.email && <span>Email: <ContactAction kind="email" value={item.email} className="font-medium text-blue-800 underline" /></span>}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.message}</p>
            <div className="flex gap-2">
              {!item.isRead && <button type="button" onClick={() => void markRead(item.id)} className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">O'qilgan deb belgilash</button>}
              <button type="button" onClick={() => void remove(item.id)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">O'chirish</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
