import { setRequestLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import ReviewsCarousel, { type ReviewCard } from '@/components/ReviewsCarousel'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import { parseI18n } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tr, tc] = await Promise.all([
    getTranslations('reviews'),
    getTranslations('tours'),
    getTranslations('common'),
  ])

  const reviews = await prisma.review.findMany({
    where: { isPublished: true, isApproved: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const cards: ReviewCard[] = reviews.map((r) => ({
    id: r.id,
    author: r.author,
    country: r.country,
    rating: r.rating,
    text: parseI18n(r.text, locale),
    tourTitle: parseI18n(r.tourTitle, locale),
    avatar: r.avatar,
    image: r.image,
  }))

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-brand-300">{tr('title')}</p>
            <h1 className="display-xl max-w-5xl text-white">{t('title')}</h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300">{t('sub')}</p>

            {avg ? (
              <div className="mt-10 flex flex-wrap items-center gap-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-6xl text-white">{avg}</span>
                  <span className="text-brand-300">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </span>
                </div>
                <p className="text-sm uppercase tracking-[0.2em] text-ink-400">
                  {reviews.length} {t('allReviews').toLowerCase()}
                </p>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        <ReviewsCarousel
          reviews={cards}
          emptyTitle={t('empty')}
          emptyHint={t('drag')}
          dragLabel={t('drag')}
        />
      </section>

      <CtaBand
        title={t('title')}
        subtitle={t('sub')}
        buttonLabel={tc('bookNow')}
        phone={PHONE_DISPLAY}
        whatsappUrl={WHATSAPP_URL}
      />
    </>
  )
}
