import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { parseI18n } from '@/lib/i18n-fields'
import { deleteSlideAction, toggleSlideAction } from '../content-actions'
import { DeleteButton, RowSubmit } from '../_components/ui'
import { EmptyState } from '../_components/fields'

export default async function AdminSlidesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>
}) {
  await requireSession()
  const { saved, deleted } = await searchParams

  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-wide text-white uppercase">
            Hero slides
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            The rotating images on the home page, in order.
          </p>
        </div>
        <Link
          href="/admin/slides/new"
          className="rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-flame-400"
        >
          New slide
        </Link>
      </header>

      {saved ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Slide saved.
        </p>
      ) : null}
      {deleted ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Slide deleted.
        </p>
      ) : null}

      {slides.length === 0 ? (
        <EmptyState message="No hero slides yet." />
      ) : (
        <ul className="space-y-3">
          {slides.map((slide, index) => (
            <li
              key={slide.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt=""
                className="h-16 w-28 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/slides/${slide.id}`}
                  className="font-semibold text-white hover:text-flame-400"
                >
                  {parseI18n(slide.title, 'en') || 'Untitled slide'}
                </Link>
                <p className="mt-1 text-xs text-ink-400">
                  Position {index + 1} · {slide.align} · {slide.ctaHref}
                  {!slide.isPublished ? ' · hidden' : ''}
                </p>
              </div>

              <form action={toggleSlideAction}>
                <input type="hidden" name="id" value={slide.id} />
                <RowSubmit>{slide.isPublished ? 'Unpublish' : 'Publish'}</RowSubmit>
              </form>

              <Link
                href={`/admin/slides/${slide.id}`}
                className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-ink-600 hover:text-white"
              >
                Edit
              </Link>

              <form action={deleteSlideAction}>
                <input type="hidden" name="id" value={slide.id} />
                <DeleteButton confirmText={slide.id} />
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}