'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import ImageReveal from './ImageReveal'

type Props = {
  slug: string
  title: string
  subtitle: string
  excerpt: string
  duration: string
  region: string
  coverImage: string
  priceFrom: number | null
  priceMode: string
  highlightCount: number
  labels: { from: string; onRequest: string; perPerson: string }
  index?: number
}

/**
 * Editorial tour card: the photo is revealed behind a clip-path curtain, a
 * corner index anchors the grid, and metadata sits outside the frame so the
 * image stays the loudest element on the page.
 */
export default function TourCard({
  slug,
  title,
  subtitle,
  excerpt,
  duration,
  region,
  coverImage,
  priceFrom,
  priceMode,
  highlightCount,
  labels,
  index = 0,
}: Props) {
  const ta = useTranslations('a11y')
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link
      href={`/tours/${slug}`}
      data-cursor="view"
      data-cursor-label={ta('viewDetails')}
      className="group relative flex h-full flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-900">
        <ImageReveal
          src={coverImage}
          alt={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          delay={(index % 3) * 0.08}
          className="absolute inset-0"
        />

        {/* Darkens on hover so the overlaid type stays legible */}
        <div className="absolute inset-0 bg-ink-950/15 transition-colors duration-700 group-hover:bg-ink-950/50" />

        <span className="absolute left-4 top-4 z-10 font-mono text-[0.65rem] tracking-[0.2em] text-white/70">
          {num}
        </span>

        <div className="absolute inset-x-4 bottom-4 z-10 flex flex-wrap items-center gap-2">
          {region ? (
            <span className="rounded-full glass px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white">
              {region}
            </span>
          ) : null}
          {duration ? (
            <span className="rounded-full glass px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-200">
              {duration}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-6">
        {subtitle ? (
          <p className="eyebrow mb-3 text-ink-500 transition-colors duration-500 group-hover:text-flame-500">
            {subtitle}
          </p>
        ) : null}

        <h3 className="display-md text-white transition-colors duration-500 group-hover:text-flame-400">
          {title}
        </h3>

        {excerpt ? (
          <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-400">
            {excerpt}
          </p>
        ) : null}

        <div className="mt-6 flex items-end justify-between border-t border-ink-800 pt-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-500">
              {priceMode === 'request' || priceFrom == null
                ? labels.onRequest
                : `${labels.from} €${priceFrom}`}
            </p>
            {priceMode !== 'request' && priceFrom != null ? (
              <p className="mt-1 text-xs text-ink-600">{labels.perPerson}</p>
            ) : null}
          </div>

          <span className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-500 transition-colors duration-500 group-hover:text-white">
            {highlightCount > 0 ? `${highlightCount} · ` : ''}
            <span className="transition-transform duration-500 group-hover:translate-x-1.5">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}
