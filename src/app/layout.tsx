import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: "O'zbekiston Respublikasi IIV Xorazm akademik litseyi — Rasmiy portal",
  description: "O'zbekiston Respublikasi Ichki Ishlar Vazirligi Xorazm Akademik Litseyi rasmiy axborot va yangiliklar portali",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
