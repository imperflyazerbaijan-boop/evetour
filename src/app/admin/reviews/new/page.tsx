import Link from 'next/link'
import { requireSession } from '@/lib/admin-auth'
import ReviewForm from '../_components/ReviewForm'

export default async function NewReviewPage() {
  await requireSession()

  return (
    <div className="space-y-8">
      <header>
        <Link href="/admin/reviews" className="text-sm text-ink-400 hover:text-white">
          ← Reviews
        </Link>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
          New review
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          Only add genuine guest feedback — it is shown publicly.
        </p>
      </header>
      <ReviewForm />
    </div>
  )
}