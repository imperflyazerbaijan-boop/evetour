import { setRequestLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import HeroSlider, { type SlideData } from '@/components/HeroSlider'
import Marquee from '@/components/Marquee'
import TourCard from '@/components/TourCard'
import PlaceCard from '@/components/PlaceCard'
import ReviewsCarousel, { type ReviewCard } from '@/components/ReviewsCarousel'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import StatsRow from '@/components/StatsRow'
import SplitText from '@/components/SplitText'
import { Link } from '@/i18n/navigation'
import { parseI18n, parseI18nStrings } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, th, tc, tr, tp] = await Promise.all([
    getTranslations('home'),
    getTranslations('hero'),
    getTranslations('common'),
    getTranslations('tours'),
    getTranslations('places'),
  ])

  const [slides, tours, places, reviews] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.tour.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.place.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    prisma.review.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { sortOrder: 'asc' },
      take: 20,
    }),
  ])

  const slideData: SlideData[] = slides.map((s) => ({
    id: s.id,
    image: s.image,
    title: parseI18n(s.title, locale),
    subtitle: parseI18n(s.subtitle, locale),
    ctaLabel: parseI18n(s.ctaLabel, locale),
    ctaHref: s.ctaHref,
    align: s.align,
  }))

  const reviewCards: ReviewCard[] = reviews.map((r) => ({
    id: r.id,
    author: r.author,
    country: r.country,
    rating: r.rating,
    text: parseI18n(r.text, locale),
    tourTitle: parseI18n(r.tourTitle, locale),
    avatar: r.avatar,
    image: r.image,
  }))

  return (
    <>
      <HeroSlider slides={slideData} locale={locale} scrollLabel={th('scroll')} />

      <Marquee
        items={[
          t('marquee1'),
          t('marquee2'),
          t('marquee3'),
          t('marquee4'),
          t('marquee5'),
          t('marquee6'),
          t('marquee7'),
        ]}
      />

      <StatsRow
        stats={[
          { value: tours.length, label: t('statsTours') },
          { value: places.length, label: t('statsRegions') },
          { value: 5, label: t('statsRating') },
          { value: null, text: tc('noPrepayment'), label: t('statsYears') },
        ]}
      />
      {/* Signature tours */}
      <section className="relative mx-auto max-w-[1600px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <Reveal>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-5 text-flame-500">{tr('title')}</p>
              <SplitText
                as="h2"
                text={t('featuredTours')}
                className="display-lg block max-w-3xl text-white"
              />
              <p className="mt-5 max-w-xl text-ink-400">{t('featuredToursSub')}</p>
            </div>
            <Link
              href="/tours"
              className="group inline-flex items-center gap-2 border-b border-ink-600 pb-1 text-sm font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:border-flame-500 hover:text-white"
            >
              {tc('viewAll')}
              <span className="transition-transform group-hover:translate-x-1">â†’</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, i) => (
            <Reveal key={tour.id} delay={i * 0.07}>
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
      </section>

      {/* Places */}
      <section className="relative border-y border-ink-800 bg-ink-900/40">
        <div className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
          <Reveal>
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-5 text-flame-500">{tp('title')}</p>
                <SplitText
                  as="h2"
                  text={t('placesTitle')}
                  className="display-lg block max-w-3xl text-white"
                />
                <p className="mt-5 max-w-xl text-ink-400">{t('placesSub')}</p>
              </div>
              <Link
                href="/places"
                className="group inline-flex items-center gap-2 border-b border-ink-600 pb-1 text-sm font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:border-flame-500 hover:text-white"
              >
                {tc('viewAll')}
                <span className="transition-transform group-hover:translate-x-1">â†’</span>
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place, i) => (
              <Reveal key={place.id} delay={i * 0.06}>
                <PlaceCard
                  index={i}
                  slug={place.slug}
                  title={parseI18n(place.title, locale)}
                  summary={parseI18n(place.summary, locale)}
                  image={place.image}
                  highlights={parseI18nStrings(place.highlights, locale).slice(0, 3)}
                  distanceKm={place.distanceKm}
                  distanceLabel={
                    place.distanceKm
                      ? tp('fromBaku', { km: place.distanceKm })
                      : undefined
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* Reviews */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <div className="mb-14 text-center">
              <p className="eyebrow mb-5 text-flame-500">{tr('title')}</p>
              <SplitText
                as="h2"
                text={t('reviewsTitle')}
                className="display-lg block text-white"
              />
              <p className="mx-auto mt-5 max-w-xl text-ink-400">{t('reviewsSub')}</p>
            </div>
          </Reveal>

          <ReviewsCarousel
            reviews={reviewCards}
            emptyTitle={t('reviewsEmpty')}
            emptyHint={t('reviewsEmptyHint')}
            dragLabel="â† â†’"
          />
        </div>
      </section>

      <CtaBand
        title={t('ctaTitle')}
        subtitle={t('ctaSub')}
        buttonLabel={tc('bookNow')}
        phone={PHONE_DISPLAY}
        whatsappUrl={WHATSAPP_URL}
      />
    </>
  )
}
