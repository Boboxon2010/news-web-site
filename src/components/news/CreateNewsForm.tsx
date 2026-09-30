'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createStoredId, getStoredNews, NewsItem, saveStoredNews } from '@/lib/dataStore';

const today = () => new Date().toLocaleDateString('uz-UZ');
const emptyForm = { title: '', category: 'Tadbir', date: today(), shortDesc: '', fullContent: '' };

export default function CreateNewsForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    const item = getStoredNews().find((news) => news.id === id);
    if (!item) {
      setError('Yangilik topilmadi.');
      return;
    }
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      date: item.date,
      shortDesc: item.shortDesc,
      fullContent: item.fullContent,
    });
    setImages(item.images || []);
  }, []);

  const handleImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 4) {
      setError('Ko‘pi bilan 4 ta rasm biriktirish mumkin.');
      event.target.value = '';
      return;
    }
    if (files.some((file) => !file.type.startsWith('image/') || file.size > 900_000)) {
      setError('Rasm JPG, PNG yoki WEBP bo‘lishi va hajmi 900 KB dan oshmasligi kerak.');
      event.target.value = '';
      return;
    }

    try {
      const dataUrls = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Rasm o‘qilmadi.'));
        reader.onerror = () => reject(new Error('Rasmni o‘qishda xatolik.'));
        reader.readAsDataURL(file);
      })));
      setImages((current) => [...current, ...dataUrls]);
    } catch {
      setError('Rasmni o‘qishda xatolik yuz berdi.');
    }
    event.target.value = '';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const current = getStoredNews();
    const item: NewsItem = {
      id: editingId || createStoredId(),
      ...form,
      images,
      files: current.find((news) => news.id === editingId)?.files || [],
    };
    try {
      const response = await fetch('/api/news', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, date: item.date }),
      });
      if (response.ok) {
        const result = await response.json();
        item.id = String(result.id);
      } else if (response.status < 500 && response.status !== 404) {
        const result = await response.json();
        throw new Error(result.error || 'Yangilikni saqlab bo‘lmadi.');
      }
      const next = editingId
        ? current.map((news) => news.id === editingId ? item : news)
        : [item, ...current];
      saveStoredNews(next);
      router.push('/admin/news');
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message !== 'Failed to fetch') {
        setError(saveError.message);
        setSaving(false);
        return;
      }
      setError('Saqlash amalga oshmadi. Rasm hajmini kamaytirib qayta urinib ko‘ring.');
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{editingId ? 'Yangilikni tahrirlash' : 'Yangi yangilik'}</h1>
      </header>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">Sarlavha
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">Kategoriya
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2.5">
              <option>Tadbir</option><option>E'lon</option><option>Yutuqlar</option><option>Qabul</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">Sana
            <input required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
          </label>
        </div>
        <label className="block text-sm font-medium text-slate-700">Qisqacha mazmun
          <textarea required rows={3} value={form.shortDesc} onChange={(event) => setForm({ ...form, shortDesc: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">To‘liq matn
          <textarea required rows={8} value={form.fullContent} onChange={(event) => setForm({ ...form, fullContent: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Rasmlar (har biri 900 KB gacha, jami 4 tagacha)
          <input type="file" accept="image/*" multiple onChange={handleImages} className="mt-2 block w-full text-sm" />
        </label>
        {images.length > 0 && <div className="flex flex-wrap gap-3">
          {images.map((image, index) => <div key={`${image.slice(0, 40)}-${index}`} className="relative">
            <img src={image} alt={`Yangilik rasmi ${index + 1}`} className="h-20 w-24 rounded object-cover" />
            <button type="button" onClick={() => setImages((current) => current.filter((_, currentIndex) => currentIndex !== index))} aria-label={`${index + 1}-rasmni olib tashlash`} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-700 text-white">×</button>
          </div>)}
        </div>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button disabled={saving} className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? 'Saqlanmoqda…' : 'Saqlash'}</button>
          <button type="button" onClick={() => router.push('/admin/news')} className="rounded border border-slate-300 px-4 py-2.5 text-sm">Bekor qilish</button>
        </div>
      </form>
    </section>
  );
}
