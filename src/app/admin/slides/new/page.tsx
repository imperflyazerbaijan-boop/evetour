import Link from 'next/link'
import { requireSession } from '@/lib/admin-auth'
import SlideForm from '../_components/SlideForm'

export default async function NewSlidePage() {
  await requireSession()

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/slides" className="text-sm text-ink-400 hover:text-white">
          ← Hero slides
        </Link>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
          New slide
        </h1>
      </header>
      <SlideForm />
    </div>
  )
}