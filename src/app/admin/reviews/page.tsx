import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'
import { parseI18n } from '@/lib/i18n-fields'
import {
  approveReviewAction,
  deleteReviewAction,
  toggleReviewAction,
} from '../content-actions'
import { DeleteButton, RowSubmit } from '../_components/ui'
import { EmptyState } from '../_components/fields'
import { paginate, Pagination } from '../_components/Pagination'

/** Reviews per page. 32 seeded reviews make one long list otherwise. */
const PER_PAGE = 15

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; page?: string }>
}) {
  await requireSession()
  const { saved, deleted, page } = await searchParams

  // Two queries on purpose: one for the count/average, one for the visible
  // page. Prisma's `count` cannot be combined with the `skip`/`take` slice.
  const [total, ratings] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({ select: { rating: true } }),
  ])
  const { pages, current } = paginate(total, Number(page ?? 1), PER_PAGE)

  const reviews = await prisma.review.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    // Skip is computed from the clamped page, so a hand-edited ?page=999
    // shows the last page instead of an empty list.
    skip: (current - 1) * PER_PAGE,
    take: PER_PAGE,
  })

  // Average is over every review, not just the visible page.
  const avg =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
      : '—'

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-wide text-white uppercase">
            Reviews
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            {total} total · average {avg} ★
            {pages > 1 ? ` · page ${current} of ${pages}` : ''}
          </p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-flame-400"
        >
          New review
        </Link>
      </header>

      {saved ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Review saved.
        </p>
      ) : null}
      {deleted ? (
        <p className="rounded-xl border border-flame-500/40 bg-flame-500/10 px-4 py-3 text-sm text-flame-300">
          Review deleted.
        </p>
      ) : null}

      {reviews.length === 0 ? (
        <EmptyState message="No reviews yet." />
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-start gap-4 rounded-2xl border border-ink-800 bg-ink-900/60 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/reviews/${review.id}`}
                    className="font-semibold text-white hover:text-flame-400"
                  >
                    {review.author}
                  </Link>
                  <span className="text-xs text-flame-400">
                    {'★'.repeat(review.rating)}
                    <span className="text-ink-700">
                      {'★'.repeat(5 - review.rating)}
                    </span>
                  </span>
                  {!review.isApproved ? (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-amber-300">
                      Unapproved
                    </span>
                  ) : null}
                  {!review.isPublished ? (
                    <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-300">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink-400">
                  {parseI18n(review.text, 'en') || parseI18n(review.text, 'ru')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!review.isApproved ? (
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <RowSubmit>Approve</RowSubmit>
                  </form>
                ) : null}

                <form action={toggleReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <RowSubmit>{review.isPublished ? 'Hide' : 'Publish'}</RowSubmit>
                </form>

                <Link
                  href={`/admin/reviews/${review.id}`}
                  className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-ink-600 hover:text-white"
                >
                  Edit
                </Link>

                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <DeleteButton confirmText={review.author} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        current={current}
        pages={pages}
        basePath="/admin/reviews"
        params={{ saved, deleted }}
      />
    </div>
  )
}