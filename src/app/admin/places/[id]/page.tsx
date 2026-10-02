import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { deletePlaceAction } from '../../content-actions'
import { placeToFormValues } from '../../_lib/mappers'
import PlaceForm from '../_components/PlaceForm'
import { DeleteButton, RowSubmit } from '../../_components/ui'

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSession()
  const { id } = await params

  const place = await prisma.place.findUnique({ where: { id } })
  if (!place) notFound()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/places" className="text-sm text-ink-400 hover:text-white">
            ← Places
          </Link>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
            Edit place
          </h1>
          <p className="mt-2 font-mono text-sm text-ink-400">/{place.slug}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/en/places/${place.slug}`}
            className="rounded-xl border border-ink-700 px-5 py-3 text-sm font-semibold text-ink-200 transition-colors hover:text-white"
          >
            View ↗
          </Link>
          <form action={deletePlaceAction}>
            <input type="hidden" name="id" value={place.id} />
            <DeleteButton confirmText={place.slug} />
          </form>
        </div>
      </header>

      <PlaceForm values={placeToFormValues(place)} />
    </div>
  )
}