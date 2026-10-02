import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { parseI18n } from '@/lib/i18n-fields'
import { deleteTourAction, toggleTourAction } from '../content-actions'
import { DeleteButton, RowSubmit } from '../_components/ui'
import { EmptyState } from '../_components/fields'

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>
}) {
  await requireSession()
  const { saved, deleted } = await searchParams

  const tours = await prisma.tour.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-wide text-white uppercase">Tours</h1>
          <p className="mt-2 text-sm text-ink-400">{tours.length} total</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-flame-400"
        >
          New tour
        </Link>
      </header>

      {saved ? <Notice tone="ok">Tour saved.</Notice> : null}
      {deleted ? <Notice tone="ok">Tour deleted.</Notice> : null}

      {tours.length === 0 ? (
        <EmptyState message="No tours yet — create the first one." />
      ) : (
        <ul className="space-y-3">
          {tours.map((tour) => (
            <li
              key={tour.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/tours/${tour.id}`}
                  className="font-semibold text-white hover:text-flame-400"
                >
                  {parseI18n(tour.title, 'en') || 'Untitled tour'}
                </Link>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-400">
                  <span className="font-mono">{tour.slug}</span>
                  <span>{tour.category}</span>
                  {tour.duration ? <span>{tour.duration}</span> : null}
                  {tour.priceFrom ? <span>€{tour.priceFrom}</span> : null}
                  {tour.isFeatured ? <span className="text-brand-300">featured</span> : null}
                </p>
              </div>

              <form action={toggleTourAction}>
                <input type="hidden" name="id" value={tour.id} />
                <RowSubmit>{tour.isPublished ? 'Unpublish' : 'Publish'}</RowSubmit>
              </form>

              <Link
                href={`/admin/tours/${tour.id}`}
                className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-ink-600 hover:text-white"
              >
                Edit
              </Link>

              <form action={deleteTourAction}>
                <input type="hidden" name="id" value={tour.id} />
                <DeleteButton confirmText={tour.slug} />
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Notice({ tone, children }: { tone: 'ok'; children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
      {children}
    </p>
  )
}