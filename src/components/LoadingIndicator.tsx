interface LoadingIndicatorProps {
  className?: string;
}

export default function LoadingIndicator({ className = '' }: LoadingIndicatorProps) {
  return (
    <div className={`flex min-h-36 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${className}`} role="status" aria-live="polite" aria-label="Ma’lumotlar yuklanmoqda">
      <span aria-hidden="true" className="h-7 w-7 shrink-0 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500 dark:border-slate-700 dark:border-t-amber-400" />
      <span className="text-sm font-semibold">Ma’lumotlar yuklanmoqda...</span>
    </div>
  );
}