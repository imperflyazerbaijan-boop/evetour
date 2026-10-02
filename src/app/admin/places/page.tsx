import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { parseI18n } from '@/lib/i18n-fields'
import { deletePlaceAction, togglePlaceAction } from '../content-actions'
import { DeleteButton, RowSubmit } from '../_components/ui'
import { EmptyState } from '../_components/fields'

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>
}) {
  await requireSession()
  const { saved, deleted } = await searchParams

  const places = await prisma.place.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-wide text-white uppercase">
            Places
          </h1>
          <p className="mt-2 text-sm text-ink-400">{places.length} total</p>
        </div>
        <Link
          href="/admin/places/new"
          className="rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-flame-400"
        >
          New place
        </Link>
      </header>

      {saved ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Place saved.
        </p>
      ) : null}
      {deleted ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Place deleted.
        </p>
      ) : null}

      {places.length === 0 ? (
        <EmptyState message="No places yet." />
      ) : (
        <ul className="space-y-3">
          {places.map((place) => (
            <li
              key={place.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/places/${place.id}`}
                  className="font-semibold text-white hover:text-flame-400"
                >
                  {parseI18n(place.title, 'en') || 'Untitled place'}
                </Link>
                <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-ink-400">
                  <span className="font-mono">{place.slug}</span>
                  {place.distanceKm !== null ? (
                    <span>{place.distanceKm} km from Baku</span>
                  ) : null}
                </p>
              </div>

              <form action={togglePlaceAction}>
                <input type="hidden" name="id" value={place.id} />
                <RowSubmit>{place.isPublished ? 'Unpublish' : 'Publish'}</RowSubmit>
              </form>

              <Link
                href={`/admin/places/${place.id}`}
                className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-ink-600 hover:text-white"
              >
                Edit
              </Link>

                <form action={deletePlaceAction}>
                  <input type="hidden" name="id" value={place.id} />
                  <DeleteButton confirmText={place.slug} />
                </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}