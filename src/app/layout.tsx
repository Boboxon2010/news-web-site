import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://xorazmiival.uz';
const siteName = 'IIV Xorazm akademik litseyi';
const siteDescription = 'IIV Xorazm akademik litseyining rasmiy sayti: qabul, ta’lim, rahbariyat va Xorazm IIV litseyi yangiliklari.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'IIV Xorazm akademik litseyi | Rasmiy sayt',
    template: '%s | IIV Xorazm akademik litseyi',
  },
  description: siteDescription,
  keywords: [
    'iiv',
    'xorazm',
    'iiv xorazm',
    'xorazm iiv',
    'iiv xorazm akademik litseyi',
    'xorazm iiv akademik litseyi',
    'iiv litsey xorazm',
    'xorazm litseyi',
    'akademik litsey xorazm',
    'ichki ishlar vazirligi litseyi',
    'iiv akademik litseyi qabul',
    'xorazm iiv litseyi yangiliklari',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: '/',
    siteName,
    title: 'IIV Xorazm akademik litseyi | Rasmiy sayt',
    description: siteDescription,
    images: ['/images/IIV_logo.png'],
  },
  twitter: {
    card: 'summary',
    title: 'IIV Xorazm akademik litseyi | Rasmiy sayt',
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
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
