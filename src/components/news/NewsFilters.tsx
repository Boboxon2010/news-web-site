'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface FilterableNews {
  id: string;
  title: string;
  category: string;
  date: string;
  shortDesc?: string;
  fullContent?: string;
}

interface NewsFiltersProps<T extends FilterableNews> {
  news: T[];
  onChange: (news: T[]) => void;
}

const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function parseNewsDate(value: string): number {
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])).getTime();
  const dayFirst = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dayFirst) return new Date(Number(dayFirst[3]), Number(dayFirst[2]) - 1, Number(dayFirst[1])).getTime();
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayDate(value: string): string {
  if (!value) return 'Sanani tanlang';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('uz-UZ');
}

export default function NewsFilters<T extends FilterableNews>({ news, onChange }: NewsFiltersProps<T>) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [hoveredDate, setHoveredDate] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => Array.from(new Set(news.map((item) => item.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [news],
  );

  const filteredNews = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;
    const uniqueNews = new Map<string, T>();

    news.forEach((item) => {
      if (!uniqueNews.has(item.id)) uniqueNews.set(item.id, item);
    });

    return Array.from(uniqueNews.values())
      .filter((item) => {
        const searchable = `${item.title} ${item.category} ${item.shortDesc || ''} ${item.fullContent || ''}`.toLocaleLowerCase();
        const timestamp = parseNewsDate(item.date);
        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (!category || item.category === category) &&
          (start === null || (timestamp > 0 && timestamp >= start)) &&
          (end === null || (timestamp > 0 && timestamp <= end))
        );
      })
      .sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date) || Number(b.id) - Number(a.id));
  }, [category, endDate, news, query, startDate]);

  useEffect(() => {
    onChange(filteredNews);
  }, [filteredNews, onChange]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => (
    index < firstDay ? null : index - firstDay + 1
  ));

  const selectDate = (day: number) => {
    const selected = dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    if (!startDate || endDate) {
      setStartDate(selected);
      setEndDate('');
    } else if (selected < startDate) {
      setStartDate(selected);
    } else {
      setEndDate(selected);
      setCalendarOpen(false);
    }
  };

  const isInRange = (day: number) => {
    const selected = dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
    const rangeEnd = endDate || hoveredDate;
    return Boolean(startDate && rangeEnd && selected > startDate && selected < rangeEnd);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setHoveredDate('');
  };

  return (
    <div ref={filterRef} className="relative w-full">
      <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-amber-500 dark:border-slate-700 dark:bg-slate-900">
        <span aria-hidden="true" className="text-lg text-slate-400">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Yangiliklardan qidirish..."
          aria-label="Yangiliklardan qidirish"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
        <button
          type="button"
          aria-label="Filtrlarni ochish"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((open) => !open)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition ${filterOpen ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
        >
          ☷
        </button>
      </div>

      {filterOpen && (
        <div className="absolute left-0 right-0 top-14 z-40 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Yangiliklarni filtrlash</h3>
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-amber-600 hover:text-amber-500">Tozalash</button>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory('')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${!category ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>Barchasi</button>
            {categories.map((item) => (
              <button type="button" key={item} onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${category === item ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{item}</button>
            ))}
          </div>

          <button type="button" onClick={() => setCalendarOpen((open) => !open)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500">Sana oralig‘i</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{startDate ? `${displayDate(startDate)}${endDate ? ` — ${displayDate(endDate)}` : ' — tugash sanasini tanlang'}` : 'Boshlanish sanasini tanlang'}</span>
          </button>

          {calendarOpen && (
            <div className="mx-auto mt-3 max-w-sm rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" aria-label="Oldingi oy" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="px-2 text-xl text-slate-500 hover:text-amber-500">‹</button>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}-y.</span>
                <button type="button" aria-label="Keyingi oy" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="px-2 text-xl text-slate-500 hover:text-amber-500">›</button>
              </div>
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => day ? (
                  <button
                    type="button"
                    key={day}
                    onClick={() => selectDate(day)}
                    onMouseEnter={() => startDate && !endDate && setHoveredDate(dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)))}
                    className={`h-9 rounded-lg text-xs font-medium ${dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)) === startDate || dateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)) === endDate ? 'bg-amber-500 font-bold text-slate-950' : isInRange(day) ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >{String(day).padStart(2, '0')}</button>
                ) : <span key={`empty-${index}`} />)}
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">{endDate ? 'Sana oralig‘i tanlandi' : 'Avval boshlanish, keyin tugash sanasini bosing'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
