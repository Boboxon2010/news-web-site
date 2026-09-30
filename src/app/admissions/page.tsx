'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import ContactAction from '@/components/ContactAction';

export default function AdmissionsPage() {
  const settings = useSiteSettings();
  const steps = [
    { num: "01", title: "Hujjat topshirish", desc: "Umumta'lim maktablarining 9-sinf bitiruvchilari my.dtm.uz (Bilimni baholash agentligi) orqali ariza topshirishadi." },
    { num: "02", title: "Tibbiy ko'rik va jismoniy tayyorgarlik", desc: "IIV maxsus komissiyasi tomonidan salomatlik va jismoniy tayyorgarlik me'yorlari sinovdan o'tkaziladi." },
    { num: "03", title: "Saralash test sinovlari", desc: "Aniq va ijtimoiy fanlar hamda psixologik darajani aniqlash bo'yicha test sinovlari topshiriladi." },
    { num: "04", title: "O'qishga qabul qilish", desc: "Test natijalariga ko'ra eng yuqori ball to'plagan nomzodlar litsey o'quvchilar safiga qabul qilinadi." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-xl">
          <span className="bg-amber-400 text-blue-950 font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
            Qabul
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            IIV Xorazm Akademik Litseyiga Qabul
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Vatanparvar, bilimli va mard yoshlarni akademik litseyimiz o'quvchilari safida kutib qolamiz.
          </p>
        </div>

        {/* Bosqichlar (Steps) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Qabul Bosqichlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <span className="text-4xl font-extrabold text-slate-100 dark:text-slate-800 absolute top-2 right-4 pointer-events-none">{step.num}</span>
                <span className="inline-block w-8 h-8 rounded-xl bg-amber-400 text-blue-950 font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="font-bold text-slate-900 text-base dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Talab qilinadigan hujjatlar */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Talab Qilinadigan Hujjatlar:</h3>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-center gap-2">✅ Ariza (Onlayn portal orqali)</li>
              <li className="flex items-center gap-2">✅ Tug'ilganlik haqida guvohnoma / ID karta nusxasi</li>
              <li className="flex items-center gap-2">✅ 9-sinfni bitirganligi haqida shahodatnoma (Attestat)</li>
              <li className="flex items-center gap-2">✅ 3x4 o'lchamli rangli fotosurat (8 ta)</li>
              <li className="flex items-center gap-2">✅ Tibbiy ma'lumotnoma (086-U shakl)</li>
            </ul>
          </div>
          <div className="bg-blue-950 text-white p-6 rounded-2xl text-center space-y-4">
            <h4 className="font-bold text-lg text-amber-400">Savollaringiz bormi?</h4>
            <p className="text-xs text-slate-300">Qabul komissiyasi ishonch telefoni orqali barcha savollaringizga javob olishingiz mumkin.</p>
            {settings.phone && <ContactAction kind="phone" value={settings.phone} className="inline-block px-6 py-3 bg-amber-400 text-blue-950 font-extrabold rounded-xl text-xs hover:bg-amber-300 transition-colors" />}
          </div>
        </div>

      </div>
    </div>
  );
}