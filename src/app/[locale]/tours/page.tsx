import { setRequestLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Link } from '@/i18n/navigation'
import TourCard from '@/components/TourCard'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import { parseI18n, parseI18nStrings } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL, TOUR_CATEGORIES } from '@/lib/site'
import FilterBar from '@/components/FilterBar'

export function generateStaticParams() {
  return TOUR_CATEGORIES.map((c) => ({ cat: c.key }))
}

export default async function ToursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
  searchParams: Promise<{ cat?: string }>
}) {
  const { locale } = await params
  const { cat } = await searchParams
  setRequestLocale(locale)

  const [t, tc, tr] = await Promise.all([
    getTranslations('tours'),
    getTranslations('common'),
    getTranslations('tours'),
  ])

  const all = await prisma.tour.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })
  const valid = TOUR_CATEGORIES.find((c) => c.key === cat)?.key
  const tours = valid ? all.filter((tour) => tour.category === valid) : all

  const cats = await getTranslations('categories')

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-brand-300">{t('title')}</p>
            <h1 className="display-xl max-w-5xl text-white">{t('sub')}</h1>
            <p className="mt-8 text-sm uppercase tracking-[0.2em] text-ink-500">
              {tr('results', { count: tours.length })}
            </p>
          </Reveal>

          <div className="mt-12">
            <FilterBar
              categories={TOUR_CATEGORIES.map((c) => ({
                key: c.key,
                label: cats(c.labelKey),
              }))}
              allLabel={t('all')}
              active={valid ?? 'all'}
              basePath="/tours"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        {tours.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-ink-700 px-8 py-20 text-center text-ink-400">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, i) => (
              <Reveal key={tour.id} delay={i * 0.05}>
                <TourCard
                  index={i}
                  slug={tour.slug}
                  title={parseI18n(tour.title, locale)}
                  subtitle={parseI18n(tour.subtitle, locale)}
                  excerpt={parseI18n(tour.excerpt, locale)}
                  duration={parseI18n(tour.duration, locale)}
                  region={parseI18n(tour.region, locale)}
                  coverImage={tour.coverImage}
                  priceFrom={tour.priceMode === 'request' ? null : tour.priceFrom}
                  priceMode={tour.priceMode}
                  highlightCount={parseI18nStrings(tour.highlights, locale).length}
                  labels={{
                    from: tc('from'),
                    onRequest: tc('onRequest'),
                    perPerson: tc('perPerson'),
                  }}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <CtaBand
        title={t('bookThis')}
        subtitle={t('sub')}
        buttonLabel={tc('bookNow')}
        phone={PHONE_DISPLAY}
        whatsappUrl={WHATSAPP_URL}
      />
    </>
  )
}
