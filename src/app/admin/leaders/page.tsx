'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createStoredId, getStoredLeaders, LeaderItem, saveStoredLeaders } from '@/lib/dataStore';

const emptyForm = { name: '', role: '', spec: '', photoUrl: '' };

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState<LeaderItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    const updateLeaders = async () => {
      try {
        const response = await fetch('/api/leaders', { cache: 'no-store' });
        if (response.ok) {
          const items = await response.json();
          setLeaders(items.length > 0 ? items : getStoredLeaders());
          return;
        }
      } catch {}
      setLeaders(getStoredLeaders());
    };
    void updateLeaders();
    window.addEventListener('datastore-update', updateLeaders);
    window.addEventListener('storage', updateLeaders);
    return () => {
      window.removeEventListener('datastore-update', updateLeaders);
      window.removeEventListener('storage', updateLeaders);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let leader: LeaderItem = { id: editingId || createStoredId(), ...form };
    try {
      const response = await fetch('/api/leaders', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leader),
      });
      if (response.ok) {
        const result = await response.json();
        leader.id = String(result.id);
      } else if (response.status < 500 && response.status !== 404) {
        const result = await response.json();
        throw new Error(result.error || 'Ma’lumotni saqlab bo‘lmadi.');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        setMessage(error.message);
        return;
      }
    }
    const nextLeaders = editingId
      ? leaders.map((item) => item.id === editingId ? leader : item)
      : [leader, ...leaders];
    saveStoredLeaders(nextLeaders);
    setLeaders(nextLeaders);
    setForm(emptyForm);
    setEditingId(null);
    setMessage('Rahbariyat ma’lumoti saqlandi.');
  };

  const selectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Faqat rasm faylini tanlang.');
      event.target.value = '';
      return;
    }
    if (file.size > 900_000) {
      setPhotoError('Rasm hajmi 900 KB dan oshmasligi kerak.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setForm((current) => ({ ...current, photoUrl: reader.result as string }));
    };
    reader.onerror = () => setPhotoError('Rasm faylini o‘qib bo‘lmadi.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const edit = (leader: LeaderItem) => {
    setEditingId(leader.id);
    setForm({ name: leader.name, role: leader.role, spec: leader.spec, photoUrl: leader.photoUrl });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Ushbu ma'lumotni o'chirishni tasdiqlaysizmi?")) return;
    try {
      const response = await fetch(`/api/leaders?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok && response.status < 500) throw new Error("Ma'lumotni o'chirib bo'lmadi.");
    } catch (error) {
      if (error instanceof Error && error.message !== 'Failed to fetch') return;
    }
    const nextLeaders = leaders.filter((leader) => leader.id !== id);
    saveStoredLeaders(nextLeaders);
    setLeaders(nextLeaders);
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-5 sm:p-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Rahbariyat va xodimlar</h1>
      </header>

      <form onSubmit={submit} className="grid gap-4 border-b border-slate-200 pb-8 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-lg font-semibold text-slate-900">{editingId ? "Ma'lumotni tahrirlash" : "Yangi ma'lumot qo'shish"}</h2>
        <label className="text-sm font-medium text-slate-700">F.I.Sh.
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium text-slate-700">Lavozimi
          <input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium text-slate-700">Qo'shimcha ma'lumot
          <textarea value={form.spec} onChange={(event) => setForm({ ...form, spec: event.target.value })} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium text-slate-700">Rasm fayli (900 KB gacha)
          <input type="file" accept="image/*" onChange={selectPhoto} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {form.photoUrl && <div className="flex items-center gap-3 sm:col-span-2">
          <img src={form.photoUrl} alt="Tanlangan rahbar rasmi" className="h-20 w-20 rounded-full object-cover" />
          <button type="button" onClick={() => setForm({ ...form, photoUrl: '' })} className="rounded border border-slate-300 px-3 py-2 text-sm">Rasmni olib tashlash</button>
        </div>}
        {photoError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{photoError}</p>}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{editingId ? 'Saqlash' : "Qo'shish"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded border border-slate-300 px-4 py-2.5 text-sm">Bekor qilish</button>}
          {message && <span role="status" className="text-sm text-emerald-700">{message}</span>}
        </div>
      </form>

      <div className="divide-y divide-slate-200">
        {leaders.length === 0 && <p className="py-8 text-sm text-slate-500">Rahbariyat ma'lumotlari hali kiritilmagan.</p>}
        {leaders.map((leader) => (
          <article key={leader.id} className="flex flex-wrap items-center gap-4 py-4">
            {leader.photoUrl && <img src={leader.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{leader.name}</h3>
              <p className="text-sm text-slate-600">{leader.role}</p>
              {leader.spec && <p className="mt-1 text-sm text-slate-500">{leader.spec}</p>}
            </div>
            <button type="button" onClick={() => edit(leader)} className="rounded border border-slate-300 px-3 py-2 text-sm">Tahrirlash</button>
            <button type="button" onClick={() => remove(leader.id)} className="rounded border border-red-200 px-3 py-2 text-sm text-red-700">O'chirish</button>
          </article>
        ))}
      </div>
    </section>
  );
}
