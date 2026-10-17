'use client';

import { SiteLanguage, useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';

const languages: { code: SiteLanguage; name: string }[] = [
  { code: 'uz', name: 'O‘zbekcha' },
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
];

const controlLabels: Record<SiteLanguage, { dark: string; light: string; switchDark: string; switchLight: string; language: string }> = {
  uz: { dark: 'Tungi rejim', light: 'Kunduzgi rejim', switchDark: 'Tungi rejimga o‘tish', switchLight: 'Kunduzgi rejimga o‘tish', language: 'Tilni tanlash' },
  ru: { dark: 'Тёмная тема', light: 'Светлая тема', switchDark: 'Включить тёмную тему', switchLight: 'Включить светлую тему', language: 'Выбрать язык' },
  en: { dark: 'Dark mode', light: 'Light mode', switchDark: 'Switch to dark mode', switchLight: 'Switch to light mode', language: 'Choose language' },
};

export default function SitePreferences({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
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

      <label className="sr-only" htmlFor="site-language">{labels.language}</label>
      <select
        id="site-language"
        aria-label={labels.language}
        value={language}
        onChange={(event) => setLanguage(event.target.value as SiteLanguage)}
        className={`h-9 rounded-full border border-slate-600 bg-slate-800 px-3 text-xs font-bold text-white outline-none transition-colors hover:bg-slate-700 ${compact ? 'w-[4.5rem]' : 'w-[7.5rem]'}`}
      >
        {languages.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select>
    </div>
  );
}
