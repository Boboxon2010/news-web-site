'use client';

import { useState, useEffect } from 'react';
import { getDefaultSiteSettings, getSiteSettings, SiteSettings } from '@/lib/dataStore';
import ContactAction from '@/components/ContactAction';
import AddressLink from '@/components/AddressLink';

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>(getDefaultSiteSettings);

  const [formSent, setFormSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [emailDeliveryWarning, setEmailDeliveryWarning] = useState('');

  useEffect(() => {
    const updateSettings = () => {
      setSettings(getSiteSettings());
      fetch('/api/settings', { cache: 'no-store' })
        .then(async (response) => {
          if (!response.ok) throw new Error('Settings unavailable');
          setSettings(await response.json());
        })
        .catch(() => setSettings(getSiteSettings()));
    };
    updateSettings();
    window.addEventListener('datastore-update', updateSettings);
    window.addEventListener('storage', updateSettings);
    return () => {
      window.removeEventListener('datastore-update', updateSettings);
      window.removeEventListener('storage', updateSettings);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFormSent(false);
    setEmailDeliveryWarning('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormSent(true);
        setEmailDeliveryWarning(data.emailSent === false ? data.emailMessage : '');
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setErrorMsg(data.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.');
      }
    } catch (err) {
      setErrorMsg('Server bilan bog\'lanishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 space-y-12 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs tracking-wider uppercase">Bog'lanish</span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Biz Bilan Aloqaga Chiqing</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
          Litsey ma'muriyatiga savol, taklif yoki murojaatlaringizni yo'llashingiz mumkin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-2">
            <div className="text-2xl">📍</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Manzilimiz</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400"><AddressLink address={settings.address || 'Xorazm viloyati, Urganch shahri'} className="hover:text-amber-500 hover:underline" /></p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-2">
            <div className="text-2xl">📞</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Telefon raqam</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{settings.phone ? <ContactAction kind="phone" value={settings.phone} /> : 'Ma’lumot kiritilmagan'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-2">
            <div className="text-2xl">✉️</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Elektron pochta</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">{settings.email ? <ContactAction kind="email" value={settings.email} /> : 'Ma’lumot kiritilmagan'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-2">
            <div className="text-2xl">🕒</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Ish Vaqti</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{settings.workingHours || 'Ma’lumot kiritilmagan'}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg space-y-2">
            <div className="text-2xl">✉️</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Pochta indeksi</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{settings.postalCode || 'Ma’lumot kiritilmagan'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-5">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">Onlayn Murojaat Yuborish</h3>

          {formSent && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs p-4 rounded-2xl text-center">
              ✅ Murojaatingiz admin paneliga saqlandi.{settings.email && !emailDeliveryWarning ? ` Xabarnoma ${settings.email} manziliga yuborildi.` : ''}
            </div>
          )}

          {emailDeliveryWarning && <p role="status" className="text-xs text-amber-700">{emailDeliveryWarning}</p>}

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-400 text-xs p-4 rounded-2xl text-center">
              ❌ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ism va Familiyangiz</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: Azizbek Karimov"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon raqamingiz (ixtiyoriy)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emailingiz (ixtiyoriy)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Emailingizni kiriting"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-amber-400"
            />
            <p className="mt-1 text-[11px] text-slate-500">Bog‘lanish uchun telefon yoki emaildan kamida bittasini kiriting.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Murojaat Yoki Savolingiz Matni</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Murojaatingizni shu yerga yozing..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-amber-400"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Yuborilmoqda...' : 'Murojaatni Yuborish'}
          </button>
        </form>
      </div>
    </main>
  );
}
