import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/admin-auth'

export default async function AdminDashboard() {
  const session = await requireSession()

  const [tourCount, placeCount, reviewCount, unread, latest] = await Promise.all([
    prisma.tour.count(),
    prisma.place.count(),
    prisma.review.count({ where: { isPublished: true, isApproved: true } }),
    prisma.message.count({ where: { isRead: false } }),
    prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  const stats = [
    { label: 'Tours', value: tourCount, href: '/admin/tours' },
    { label: 'Places', value: placeCount, href: '/admin/places' },
    { label: 'Live reviews', value: reviewCount, href: '/admin/reviews' },
    { label: 'Unread messages', value: unread, href: '/admin/messages' },
  ]

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
          Signed in as {session.email}
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-white uppercase">
          Dashboard
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-3xl border border-ink-800 bg-ink-900/60 p-6 transition-colors hover:border-flame-500/60"
          >
            <p className="font-display text-5xl text-white">{s.value}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-ink-400">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border border-ink-800 bg-ink-900/60 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-white uppercase">
            Latest messages
          </h2>
          <Link href="/admin/messages" className="text-sm text-brand-300 hover:text-white">
            View all →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="mt-6 text-sm text-ink-400">
            No messages yet. Contact-form submissions land here.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-ink-800">
            {latest.map((m) => (
              <li key={m.id} className="flex items-start gap-4 py-4">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    m.isRead ? 'bg-ink-700' : 'bg-flame-500'
                  }`}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="truncate text-sm text-ink-400">{m.contact}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-300">{m.text}</p>
                </div>
                <time className="ml-auto shrink-0 text-xs text-ink-500">
                  {m.createdAt.toLocaleDateString('en-GB')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-ink-500">
        Content on this site is managed through these pages — edits revalidate the
        public site immediately.
      </p>
    </div>
  )
}