import { setRequestLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Reveal from '@/components/Reveal'
import CtaBand from '@/components/CtaBand'
import { parseI18n, parseStringArray } from '@/lib/i18n-fields'
import { PHONE_DISPLAY, WHATSAPP_URL } from '@/lib/site'

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: 'en' | 'ru' }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tg, tc] = await Promise.all([
    getTranslations('gallery'),
    getTranslations('gallery'),
    getTranslations('common'),
  ])

  const [tours, places] = await Promise.all([
    prisma.tour.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.place.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  // Collect every image with its caption, then de-duplicate
  const seen = new Set<string>()
  const photos: { src: string; alt: string }[] = []

  for (const tour of tours) {
    const title = parseI18n(tour.title, locale)
    for (const src of [tour.coverImage, ...parseStringArray(tour.images)]) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      photos.push({ src, alt: title })
    }
  }
  for (const place of places) {
    const title = parseI18n(place.title, locale)
    for (const src of [place.image, ...parseStringArray(place.images)]) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      photos.push({ src, alt: title })
    }
  }

  return (
    <>
      <section className="relative pt-40 pb-16 sm:pt-48">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
          <Reveal>
            <p className="eyebrow mb-5 text-brand-300">{tg('title')}</p>
            <h1 className="display-xl max-w-5xl text-white">{t('title')}</h1>
            <p className="mt-8 max-w-2xl text-lg text-ink-300">{t('sub')}</p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-ink-500">
              {photos.length} {t('photos')}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 sm:px-10 lg:px-16 lg:pb-32">
        {/* Masonry-style columns */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {photos.map((p, i) => (
            <Reveal key={p.src} delay={(i % 6) * 0.05} y={26}>
              <figure className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-ink-800">
                <div className="relative w-full">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={1200}
                    height={800}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full transition-transform duration-[1.4s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-sm font-semibold text-white">{p.alt}</span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        title={t('sub')}
        subtitle={t('title')}
        buttonLabel={tc('bookNow')}
        phone={PHONE_DISPLAY}
        whatsappUrl={WHATSAPP_URL}
      />
    </>
  )
}
