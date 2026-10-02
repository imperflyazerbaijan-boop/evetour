import Link from 'next/link'
import { requireSession } from '@/lib/admin-auth'
import TourForm from '../_components/TourForm'

export default async function NewTourPage() {
  await requireSession()

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/tours" className="text-sm text-ink-400 hover:text-white">
          ← Tours
        </Link>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
          New tour
        </h1>
      </header>
      <TourForm />
    </div>
  )
}