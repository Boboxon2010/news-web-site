'use client';

import { FormEvent, useEffect, useState } from 'react';
import { getDefaultSiteSettings, getSiteSettings, saveSiteSettings, SiteSettings } from '@/lib/dataStore';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(getDefaultSiteSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [credentials, setCredentials] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
  const [accountSaved, setAccountSaved] = useState(false);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    setSettings(getSiteSettings());
    fetch('/api/settings', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('');
        setSettings(await response.json());
      })
      .catch(() => setSettings(getSiteSettings()));
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        if (response.ok) setUsername((await response.json()).username || '');
      })
      .catch(() => undefined);
  }, []);

  const update = (key: keyof SiteSettings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Sozlamalarni serverga saqlab bo‘lmadi.');
      }
      saveSiteSettings(settings);
      setSaved(true);
      return;
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message) {
        setError(saveError.message);
        return;
      }
    }
  };

  const fields: { key: keyof SiteSettings; label: string; multiline?: boolean }[] = [
    { key: 'heroTitle', label: 'Asosiy sarlavha' },
    { key: 'heroSubtitle', label: 'Qisqa ta’rif' },
    { key: 'badgeText', label: 'Badge matni' },
    { key: 'aboutTitle', label: 'About sahifasi sarlavhasi' },
    { key: 'aboutSubtitle', label: 'About sahifasi qisqa matni' },
    { key: 'newsTitle', label: 'News sahifasi sarlavhasi' },
    { key: 'newsSubtitle', label: 'News sahifasi qisqa matni' },
    { key: 'address', label: 'Manzil' },
    { key: 'phone', label: 'Telefon raqam' },
    { key: 'email', label: 'Elektron pochta' },
    { key: 'workingHours', label: 'Ish vaqti' },
    { key: 'postalCode', label: 'Pochta indeksi' },
  ];

  const updateCredentials = (key: keyof typeof credentials, value: string) => {
    setCredentials((current) => ({ ...current, [key]: value }));
    setAccountSaved(false);
    setAccountError('');
  };

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountError('');
    setAccountSaved(false);
    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Akkaunt ma’lumotlarini saqlab bo‘lmadi.');
      setUsername(result.username);
      setCredentials({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
      setAccountSaved(true);
    } catch (accountSaveError) {
      setAccountError(accountSaveError instanceof Error ? accountSaveError.message : 'Server bilan bog‘lanishda xatolik.');
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase text-amber-700">IIV Xorazm akademik litseyi</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Sayt sozlamalari</h1>
      </header>
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ key, label }) => (
          <label key={key} className="text-sm font-medium text-slate-700">
            {label}
            {key.endsWith('Subtitle') || key === 'badgeText' || key === 'address' || key === 'workingHours' ? (
              <textarea value={settings[key]} onChange={(event) => update(key, event.target.value)} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
            ) : (
              <input type={key === 'email' ? 'email' : 'text'} value={settings[key]} onChange={(event) => update(key, event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
            )}
          </label>
        ))}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Sozlamalarni saqlash</button>
          {saved && <span role="status" className="text-sm text-emerald-700">Saqlandi</span>}
          {error && <span role="alert" className="text-sm text-red-700">{error}</span>}
        </div>
      </form>

      <section className="space-y-5 border-t border-slate-200 pt-6">
        <header>
          <p className="text-xs font-semibold uppercase text-amber-700">Xavfsizlik</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Admin login va paroli</h2>
          <p className="mt-1 text-sm text-slate-500">Joriy login: <strong className="text-slate-700">{username || '...'}</strong>. O‘zgarishlarni tasdiqlash uchun joriy parol talab qilinadi.</p>
        </header>
        <form onSubmit={submitCredentials} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Joriy parol
            <input type="password" autoComplete="current-password" required value={credentials.currentPassword} onChange={(event) => updateCredentials('currentPassword', event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 caret-slate-900" />
          </label>
          <label className="text-sm font-medium text-slate-700">Yangi login (ixtiyoriy)
            <input type="text" autoComplete="username" minLength={3} maxLength={32} value={credentials.newUsername} onChange={(event) => updateCredentials('newUsername', event.target.value)} placeholder={username || 'Yangi login'} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 caret-slate-900" />
          </label>
          <label className="text-sm font-medium text-slate-700">Yangi parol (ixtiyoriy)
            <input type="password" autoComplete="new-password" value={credentials.newPassword} onChange={(event) => updateCredentials('newPassword', event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 caret-slate-900" />
          </label>
          <label className="text-sm font-medium text-slate-700">Yangi parolni tasdiqlash
            <input type="password" autoComplete="new-password" value={credentials.confirmPassword} onChange={(event) => updateCredentials('confirmPassword', event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-500 caret-slate-900" />
          </label>
          <p className="text-xs text-slate-500 sm:col-span-2">Yangi parol kamida 12 belgidan iborat bo‘lib, katta-kichik harf, raqam va maxsus belgini o‘z ichiga olishi kerak. Faqat loginni yoki faqat parolni ham o‘zgartirish mumkin.</p>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button className="rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Login/parolni yangilash</button>
            {accountSaved && <span role="status" className="text-sm text-emerald-700">Akkaunt ma’lumotlari saqlandi.</span>}
            {accountError && <span role="alert" className="text-sm text-red-700">{accountError}</span>}
          </div>
        </form>
      </section>

      <p className="text-xs text-slate-500">Telefon, e-pochta, aniq manzil, ish vaqti va pochta indeksini rasmiy tasdiqlangan qiymatlar bilan to‘ldiring.</p>
    </section>
  );
}
