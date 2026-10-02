import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { deleteTourAction } from '../../content-actions'
import { tourToFormValues } from '../../_lib/mappers'
import TourForm from '../_components/TourForm'
import { DeleteButton, RowSubmit } from '../../_components/ui'

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSession()
  const { id } = await params

  const tour = await prisma.tour.findUnique({ where: { id } })
  if (!tour) notFound()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/tours" className="text-sm text-ink-400 hover:text-white">
            ← Tours
          </Link>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
            Edit tour
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-400">/{tour.slug}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/en/tours/${tour.slug}`}
            className="rounded-xl border border-ink-700 px-5 py-3 text-sm font-semibold text-ink-200 transition-colors hover:text-white"
          >
            View ↗
          </Link>
          <form action={deleteTourAction}>
            <input type="hidden" name="id" value={tour.id} />
            <DeleteButton confirmText={tour.slug} />
          </form>
        </div>
      </header>

      <TourForm values={tourToFormValues(tour)} />
    </div>
  )
}