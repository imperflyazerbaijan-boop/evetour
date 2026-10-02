'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import ImageReveal from './ImageReveal'

type Props = {
  slug: string
  title: string
  summary: string
  image: string
  highlights: string[]
  distanceKm: number | null
  distanceLabel?: string
  index?: number
}

/**
 * Place card. A tall frame with the title overlaid and the details sliding
 * in on hover, so a grid of six reads as photography rather than as UI.
 */
export default function PlaceCard({
  slug,
  title,
  summary,
  image,
  highlights,
  distanceKm,
  distanceLabel,
  index = 0,
}: Props) {
  const ta = useTranslations('a11y')

  return (
    <Link
      href={`/places/${slug}`}
      data-cursor="view"
      data-cursor-label={ta('viewDetails')}
      className="group relative block overflow-hidden rounded-2xl bg-ink-900"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <ImageReveal
          src={image}
          alt={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          delay={(index % 3) * 0.08}
          className="absolute inset-0"
        />

        {/* Scrim is always present so the type never fights the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />

        {distanceLabel ? (
          <span className="absolute left-4 top-4 z-10 rounded-full glass px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white">
            {distanceLabel}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 p-6">
          {summary ? <p className="eyebrow mb-2 text-ink-400">{summary}</p> : null}
          <h3 className="display-md text-white">{title}</h3>

          {highlights.length > 0 ? (
            <ul className="mt-4 space-y-1.5 overflow-hidden">
              {highlights.map((h, i) => (
                <li
                  key={h}
                  className="flex translate-y-3 items-start gap-2 text-sm text-ink-300 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ transitionDelay: `${0.06 * i}s` }}
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-flame-500" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
