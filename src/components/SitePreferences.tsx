'use client';

import { useState } from 'react';
import { SiteLanguage, useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';

const languages: { code: SiteLanguage; flag: string; name: string }[] = [
  { code: 'uz', flag: '🇺🇿', name: 'O‘zbekcha' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
];

const controlLabels: Record<SiteLanguage, { dark: string; light: string; switchDark: string; switchLight: string; language: string }> = {
  uz: { dark: 'Tungi rejim', light: 'Kunduzgi rejim', switchDark: 'Tungi rejimga o‘tish', switchLight: 'Kunduzgi rejimga o‘tish', language: 'Tilni tanlash' },
  ru: { dark: 'Тёмная тема', light: 'Светлая тема', switchDark: 'Включить тёмную тему', switchLight: 'Включить светлую тему', language: 'Выбрать язык' },
  en: { dark: 'Dark mode', light: 'Light mode', switchDark: 'Switch to dark mode', switchLight: 'Switch to light mode', language: 'Choose language' },
};

export default function SitePreferences({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const currentLanguage = languages.find((item) => item.code === language) || languages[0];
  const labels = controlLabels[language];

  return (
    <div className="flex items-center gap-2" data-no-translate>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'light' ? labels.switchDark : labels.switchLight}
        title={theme === 'light' ? labels.switchDark : labels.switchLight}
        className="flex h-9 items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 text-xs font-bold text-amber-300 transition-colors hover:bg-slate-700"
      >
        <span aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
        {!compact && <span className="hidden sm:inline">{theme === 'light' ? labels.dark : labels.light}</span>}
      </button>

      <div className="relative">
        <button
          type="button"
          aria-label={labels.language}
          aria-expanded={isLanguageOpen}
          aria-haspopup="listbox"
          title={labels.language}
          onClick={() => setIsLanguageOpen((open) => !open)}
          className="flex h-9 items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-700"
        >
          <span className="text-base" aria-hidden="true">{currentLanguage.flag}</span>
          {!compact && <span>{language.toUpperCase()}</span>}
        </button>
        {isLanguageOpen && (
          <div role="listbox" aria-label={labels.language} className="absolute right-0 top-11 z-[80] flex gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-xl">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={language === item.code}
                aria-label={item.name}
                title={item.name}
                onClick={() => {
                  setLanguage(item.code);
                  setIsLanguageOpen(false);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-colors ${language === item.code ? 'border-amber-400 bg-amber-400/15' : 'border-slate-700 hover:border-slate-400'}`}
              >
                {item.flag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
