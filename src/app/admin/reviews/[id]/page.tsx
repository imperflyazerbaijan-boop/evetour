import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { deleteReviewAction } from '../../content-actions'
import { reviewToFormValues } from '../../_lib/mappers'
import ReviewForm from '../_components/ReviewForm'
import { DeleteButton, RowSubmit } from '../../_components/ui'

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireSession()
  const { id } = await params

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) notFound()

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/reviews" className="text-sm text-ink-400 hover:text-white">
            ← Reviews
          </Link>
          <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
            Edit review
          </h1>
          <p className="mt-2 text-sm text-ink-400">{review.author}</p>
        </div>

        <form action={deleteReviewAction}>
          <input type="hidden" name="id" value={review.id} />
          <DeleteButton confirmText={review.author} />
        </form>
      </header>

      <ReviewForm values={reviewToFormValues(review)} />
    </div>
  )
}