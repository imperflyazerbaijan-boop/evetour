import { setRequestLocale, getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import Reveal from '@/components/Reveal'
import PlaceCard from '@/components/PlaceCard'
import CtaBand from '@/components/CtaBand'
import { parseI18n, parseI18nStrings } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export default async function PlacesPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tp, tc] = await Promise.all([
    getTranslations('places'),
    getTranslations('places'),
    getTranslations('common'),
  ])

  const places = await prisma.place.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-brand-300">{tp('gallery')}</p>
            <h1 className="display-xl max-w-5xl text-white">{t('title')}</h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300">{t('sub')}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place, i) => (
            <Reveal key={place.id} delay={i * 0.05}>
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
