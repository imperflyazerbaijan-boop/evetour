import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Reveal from '@/components/Reveal'
import TourCard from '@/components/TourCard'
import { routing } from '@/i18n/routing'
import {
  parseI18n,
  parseI18nStrings,
  parseStringArray,
  parseItinerary,
} from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export async function generateStaticParams() {
  const tours = await prisma.tour.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return routing.locales.flatMap((locale) =>
    tours.map((t) => ({ locale, slug: t.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru'; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const tour = await prisma.tour.findFirst({ where: { slug } })
  if (!tour) return {}
  return {
    title: parseI18n(tour.title, locale),
    description: parseI18n(tour.excerpt, locale),
    openGraph: { images: [tour.coverImage] },
  }
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru'; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const tour = await prisma.tour.findFirst({ where: { slug, isPublished: true } })
  if (!tour) notFound()

  const [t, tc] = await Promise.all([
    getTranslations('tours'),
    getTranslations('common'),
  ])

  const related = await prisma.tour.findMany({
    where: {
      isPublished: true,
      category: tour.category,
      id: { not: tour.id },
    },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  })

  const title = parseI18n(tour.title, locale)
  const subtitle = parseI18n(tour.subtitle, locale)
  const description = parseI18n(tour.description, locale)
  const highlights = parseI18nStrings(tour.highlights, locale)
  const includes = parseI18nStrings(tour.includes, locale)
  const excludes = parseI18nStrings(tour.excludes, locale)
  const itinerary = parseItinerary(tour.itinerary)
  const images = parseStringArray(tour.images)
  const showPrice = tour.priceMode !== 'request' && tour.priceFrom != null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: title,
    description,
    touristType: 'Private tour',
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: itinerary.length,
      itemListElement: itinerary.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: parseI18n(d.title, locale),
      })),
    },
    offers: {
      '@type': 'Offer',
      price: showPrice ? tour.priceFrom : undefined,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[75svh] items-end pt-32">
        <Image
          src={tour.coverImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/70" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-20 sm:px-10 lg:px-16">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              {parseI18n(tour.region, locale) ? (
                <span className="rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {parseI18n(tour.region, locale)}
                </span>
              ) : null}
              <span className="rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                {parseI18n(tour.duration, locale)}
              </span>
              <span className="rounded-full bg-flame-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                {tc('noPrepayment')}
              </span>
            </div>

            {subtitle ? (
              <p className="eyebrow mt-8 text-brand-300">{subtitle}</p>
            ) : null}
            <h1 className="display-lg mt-4 max-w-5xl text-white">{title}</h1>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Reveal>
              <p className="max-w-3xl text-lg leading-relaxed text-ink-200">
                {description}
              </p>
            </Reveal>

            {highlights.length > 0 ? (
              <Reveal>
                <div className="mt-14">
                  <h2 className="eyebrow mb-6 text-brand-300">{t('highlights')}</h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 rounded-2xl border border-ink-800 bg-ink-900/60 px-5 py-4 text-ink-200"
                      >
                        <span className="mt-1 text-flame-500">â—†</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
            {itinerary.length > 0 ? (
              <Reveal>
                <div className="mt-14">
                  <h2 className="eyebrow mb-6 text-brand-300">{t('itinerary')}</h2>
                  <ol className="space-y-6">
                    {itinerary.map((day, i) => (
                      <li
                        key={i}
                        className="relative flex gap-6 border-l-2 border-ink-800 pb-6 pl-8 last:border-transparent"
                      >
                        <span className="absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-flame-500 text-[0.6rem] font-bold text-white">
                          {day.day ?? i + 1}
                        </span>
                        <div>
                          <h3 className="display-md text-white">
                            {parseI18n(day.title, locale)}
                          </h3>
                          <p className="mt-2 max-w-2xl text-ink-400">
                            {parseI18n(day.desc, locale)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ) : null}

            {images.length > 0 ? (
              <Reveal>
                <div className="mt-14">
                  <h2 className="eyebrow mb-6 text-brand-300">{t('gallery')}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.map((src) => (
                      <div
                        key={src}
                        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink-800"
                      >
                        <Image
                          src={src}
                          alt={title}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[1.2s] hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="rounded-3xl border border-ink-800 bg-ink-900/80 p-7">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-500">
                  {t('price')}
                </p>
                <p className="mt-2 font-display text-5xl text-white">
                  {showPrice ? (
                    <>
                      <span className="text-2xl text-ink-400">
                        {tc('from')} â‚¬
                      </span>{' '}
                      {tour.priceFrom}
                    </>
                  ) : (
                    <span className="text-3xl">{tc('onRequest')}</span>
                  )}
                </p>
                {showPrice ? (
                  <p className="mt-1 text-xs text-ink-500">{tc('perPerson')}</p>
                ) : null}

                <dl className="mt-7 space-y-4 border-t border-ink-800 pt-6 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-500">{t('duration')}</dt>
                    <dd className="text-right text-ink-200">
                      {parseI18n(tour.duration, locale)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-500">{t('region')}</dt>
                    <dd className="text-right text-ink-200">
                      {parseI18n(tour.region, locale)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-500">{tc('privateTour')}</dt>
                    <dd className="text-right text-brand-300">Yes</dd>
                  </div>
                </dl>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-primary mt-7 block rounded-full bg-flame-500 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-flame-400"
                >
                  {t('bookThis')}
                </a>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}
                  className="mt-3 block rounded-full border border-ink-700 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-ink-200 transition hover:border-white hover:text-white"
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
            </Reveal>

            {includes.length > 0 ? (
              <Reveal>
                <div className="mt-6 rounded-3xl border border-ink-800 bg-ink-900/60 p-7">
                  <h3 className="eyebrow mb-5 text-brand-300">{t('included')}</h3>
                  <ul className="space-y-3">
                    {includes.map((i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink-300">
                        <span className="text-brand-300">âœ“</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            {excludes.length > 0 ? (
              <Reveal>
                <div className="mt-6 rounded-3xl border border-ink-800 bg-ink-900/60 p-7">
                  <h3 className="eyebrow mb-5 text-ink-400">{t('excluded')}</h3>
                  <ul className="space-y-3">
                    {excludes.map((i) => (
                      <li key={i} className="flex gap-3 text-sm text-ink-400">
                        <span className="text-ink-600">Ã—</span>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </aside>
        </div>
      </section>
      {related.length > 0 ? (
        <section className="border-t border-ink-800 bg-ink-900/40">
          <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-16">
            <Reveal>
              <h2 className="display-lg mb-12 text-white">{t('relatedTitle')}</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.06}>
                  <TourCard
                    index={i}
                    slug={r.slug}
                    title={parseI18n(r.title, locale)}
                    subtitle={parseI18n(r.subtitle, locale)}
                    excerpt={parseI18n(r.excerpt, locale)}
                    duration={parseI18n(r.duration, locale)}
                    region={parseI18n(r.region, locale)}
                    coverImage={r.coverImage}
                    priceFrom={r.priceMode === 'request' ? null : r.priceFrom}
                    priceMode={r.priceMode}
                    highlightCount={parseI18nStrings(r.highlights, locale).length}
                    labels={{
                      from: tc('from'),
                      onRequest: tc('onRequest'),
                      perPerson: tc('perPerson'),
                    }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
