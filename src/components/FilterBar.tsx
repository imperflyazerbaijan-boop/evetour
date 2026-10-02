'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'

type Props = {
  categories: { key: string; label: string }[]
  allLabel: string
  active: string
  basePath: string
}

/** Category pills that push a query param and scroll back to the top. */
export default function FilterBar({
  categories,
  allLabel,
  active,
  basePath,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pick = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') params.delete('cat')
    else params.set('cat', key)
    const qs = params.toString()
    router.push(`${basePath}${qs ? `?${qs}` : ''}`)
    router.refresh()
  }

  // Strip the locale prefix so the router works with the raw pathname
  const locale = pathname.split('/').filter(Boolean)[0]
  const base =
    routing.locales.includes(locale as Locale)
      ? `/${pathname.split('/').filter(Boolean).slice(1).join('/')}`
      : pathname

  return (
    <div className="no-scrollbar -mx-6 flex gap-2.5 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        onClick={() => pick('all')}
        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
          active === 'all'
            ? 'bg-flame-500 text-white'
            : 'border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-white'
        }`}
      >
        {allLabel}
      </button>
      {categories.map((c) => (
        <button
          key={c.key}
          onClick={() => pick(c.key)}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            active === c.key
              ? 'bg-flame-500 text-white'
              : 'border border-ink-700 text-ink-300 hover:border-ink-500 hover:text-white'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
