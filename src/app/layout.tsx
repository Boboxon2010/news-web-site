import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import type { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xorazmiival.uz').replace(/\/$/, '');
const siteName = 'Xorazm IIV litseyi';
const siteDescription = 'Xorazm IIV litseyi rasmiy sayti: qabul, ta’lim, rahbariyat, yangiliklar va xorazm iiv litsey haqida ma’lumotlar.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Xorazm IIV litseyi | Rasmiy sayt',
    template: '%s | Xorazm IIV litseyi',
  },
  description: siteDescription,
  icons: {
    icon: '/images/webico.webp',
    shortcut: '/images/webico.webp',
    apple: '/images/webico.webp',
  },
  keywords: [
    'xorazm iiv litsey',
    'iiv litsey xorazm',
    'xorazm iiv akademik litsey',
    'xorazm akademik litsey iiv',
    'xorazm iiv litseyi',
    'iiv litsey',
    'xorazm litsey',
    'xorazm iiv',
    'iiv xorazm',
    'xorazm iiv litsey qabul',
    'xorazm akademik litsey',
    'xorazm iiv litsey yangiliklari',
    'iiv xorazm akademik litsey',
    'ichki ishlar vazirligi litseyi',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: '/',
    siteName,
    title: 'Xorazm IIV litseyi | Rasmiy sayt',
    description: siteDescription,
    images: ['/images/IIV_logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Xorazm IIV litseyi | Rasmiy sayt',
    description: siteDescription,
    images: ['/images/IIV_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const revalidate = 3600;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <SiteChrome>{children}</SiteChrome>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
