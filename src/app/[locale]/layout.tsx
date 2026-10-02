import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PHONE_DISPLAY, SITE_URL } from '@/lib/site'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import CustomCursor from '@/components/CustomCursor'
import PageTransition from '@/components/PageTransition'
import Grain from '@/components/Grain'
import '../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

/**
 * Display face for headlines. Bebas Neue was Latin-only, so Russian text
 * silently fell back to Arial Narrow and the headings changed weight and
 * width when the locale switched. Oswald is condensed like Bebas and ships
 * both latin and cyrillic subsets, so EN and RU render in the same face.
 */
const oswald = Oswald({
  variable: '--font-display-face',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'EVE TOUR — Private tours in Azerbaijan',
    template: '%s · EVE TOUR',
  },
  description:
    'Private tours across Azerbaijan from Baku — Sheki, Quba, Absheron, Gobustan mud volcanoes, Caspian coast and adventure sports. No prepayment.',
  keywords: [
    'Azerbaijan tours',
    'Baku tours',
    'private tour Azerbaijan',
    'Sheki tour',
    'Quba tour',
    'Gobustan mud volcanoes',
    'paragliding Baku',
  ],
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/brand/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'EVE TOUR',
    title: 'EVE TOUR — Private tours in Azerbaijan',
    description:
      'Private tours across Azerbaijan from Baku. No prepayment, fully flexible routes.',
    images: ['/brand/icon-512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EVE TOUR — Private tours in Azerbaijan',
    description: 'Private tours across Azerbaijan from Baku. No prepayment.',
    images: ['/brand/icon-512.png'],
  },
  alternates: {
    canonical: '/',
    languages: { en: '/en', ru: '/ru' },
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ink-950 text-ink-100">
        <NextIntlClientProvider>
          {/* Phone is the primary conversion channel for a tour business —
              expose it as structured data for search engines. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TravelAgency',
                name: 'EVE TOUR',
                telephone: PHONE_DISPLAY,
                areaServed: 'Azerbaijan',
                url: SITE_URL,
                sameAs: ['https://www.instagram.com/evetour.az/'],
              }),
            }}
          />
          <PageTransition />
          <CustomCursor />
          <Grain />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
