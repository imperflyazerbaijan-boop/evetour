import Link from 'next/link'
import { requireSession } from '@/lib/admin-auth'
import PlaceForm from '../_components/PlaceForm'

export default async function NewPlacePage() {
  await requireSession()

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/places" className="text-sm text-ink-400 hover:text-white">
          ← Places
        </Link>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
          New place
        </h1>
      </header>
      <PlaceForm />
    </div>
  )
}