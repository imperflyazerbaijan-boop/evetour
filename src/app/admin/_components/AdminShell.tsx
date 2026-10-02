'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '../actions'

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/tours', label: 'Tours' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/slides', label: 'Hero slides' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="shrink-0 border-b border-ink-800 bg-ink-900/60 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-flame-500 font-display text-xl text-ink-950">
            E
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg tracking-wide text-white uppercase">
              EVE TOUR
            </p>
            <p className="truncate text-xs text-ink-400">{email}</p>
          </div>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-flame-500 text-ink-950'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-wrap items-center gap-2 px-6 py-6">
          <Link
            href="/en"
            className="text-xs text-ink-400 transition-colors hover:text-white"
          >
            View site ↗
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-200 transition-colors hover:border-flame-500 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        {children}
      </main>
    </div>
  )
}