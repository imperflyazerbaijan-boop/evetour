import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Reveal from '@/components/Reveal'
import PlaceCard from '@/components/PlaceCard'
import { routing } from '@/i18n/routing'
import { parseI18n, parseI18nStrings, parseStringArray } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export async function generateStaticParams() {
  const places = await prisma.place.findMany({
    where: { isPublished: true },
    select: { slug: true },
  })
  return routing.locales.flatMap((locale) =>
    places.map((p) => ({ locale, slug: p.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru'; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const place = await prisma.place.findFirst({ where: { slug } })
  if (!place) return {}
  return {
    title: parseI18n(place.title, locale),
    description: parseI18n(place.summary, locale),
    openGraph: { images: [place.image] },
  }
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru'; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const place = await prisma.place.findFirst({ where: { slug, isPublished: true } })
  if (!place) notFound()

  const [t, tc] = await Promise.all([
    getTranslations('places'),
    getTranslations('common'),
  ])

  const others = await prisma.place.findMany({
    where: { isPublished: true, id: { not: place.id } },
    orderBy: { sortOrder: 'asc' },
    take: 3,
  })

  const title = parseI18n(place.title, locale)
  const summary = parseI18n(place.summary, locale)
  const description = parseI18n(place.description, locale)
  const highlights = parseI18nStrings(place.highlights, locale)
  const images = [place.image, ...parseStringArray(place.images)].filter(
    (v, i, a) => a.indexOf(v) === i,
  )
  return (
    <>
      <section className="relative flex min-h-[70svh] items-end pt-32">
        <Image
          src={place.image}
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
              {place.distanceKm ? (
                <span className="rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {t('fromBaku', { km: place.distanceKm })}
                </span>
              ) : null}
              {parseI18n(place.bestSeason, locale) ? (
                <span className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-950">
                  {t('bestSeason')}: {parseI18n(place.bestSeason, locale)}
                </span>
              ) : null}
            </div>
            {summary ? (
              <p className="eyebrow mt-8 text-brand-300">{summary}</p>
            ) : null}
            <h1 className="display-lg mt-4 max-w-5xl text-white">{title}</h1>
          </Reveal>
        </div>
      </section>

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
                <div className="mt-12">
                  <h2 className="eyebrow mb-6 text-brand-300">
                    {t('bestSeason')}
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 rounded-2xl border border-ink-800 bg-ink-900/60 px-5 py-4 text-ink-200"
                      >
                        <span className="mt-1 text-brand-300">â—†</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            {images.length > 1 ? (
              <Reveal>
                <div className="mt-14">
                  <h2 className="eyebrow mb-6 text-brand-300">{t('gallery')}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {images.slice(1).map((src) => (
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
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="rounded-3xl border border-ink-800 bg-ink-900/80 p-7">
                <h2 className="display-md text-white">{title}</h2>
                <dl className="mt-6 space-y-4 border-t border-ink-800 pt-6 text-sm">
                  {place.distanceKm ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">Distance</dt>
                      <dd className="text-right text-ink-200">
                        {place.distanceKm} km
                      </dd>
                    </div>
                  ) : null}
                  {place.coordinates ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">GPS</dt>
                      <dd className="text-right text-ink-200">
                        {place.coordinates}
                      </dd>
                    </div>
                  ) : null}
                  {parseI18n(place.bestSeason, locale) ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-500">{t('bestSeason')}</dt>
                      <dd className="text-right text-ink-200">
                        {parseI18n(place.bestSeason, locale)}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-primary mt-7 block rounded-full bg-flame-500 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-flame-400"
                >
                  {tc('bookNow')}
                </a>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}
                  className="mt-3 block rounded-full border border-ink-700 px-6 py-4 text-center text-sm font-bold uppercase tracking-widest text-ink-200 transition hover:border-white hover:text-white"
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
      {others.length > 0 ? (
        <section className="border-t border-ink-800 bg-ink-900/40">
          <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-16">
            <Reveal>
              <h2 className="display-lg mb-12 text-white">{t('title')}</h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <PlaceCard
                    index={i}
                    slug={p.slug}
                    title={parseI18n(p.title, locale)}
                    summary={parseI18n(p.summary, locale)}
                    image={p.image}
                    highlights={parseI18nStrings(p.highlights, locale).slice(0, 3)}
                    distanceKm={p.distanceKm}
                    distanceLabel={
                      p.distanceKm
                        ? t('fromBaku', { km: p.distanceKm })
                        : undefined
                    }
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
