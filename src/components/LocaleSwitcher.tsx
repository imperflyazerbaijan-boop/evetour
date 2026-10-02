'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'

const LABELS: Record<Locale, string> = { en: 'EN', ru: 'RU' }

/** Client-side locale switcher that preserves the current path. */
export default function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const ta = useTranslations('a11y')
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [open, setOpen] = React.useState(false)

  const switchTo = (next: Locale) => {
    setOpen(false)
    // Strip the current locale prefix, then add the target one.
    const segments = pathname.split('/').filter(Boolean)
    if (routing.locales.includes(segments[0] as Locale)) {
      segments[0] = next
    } else {
      segments.unshift(next)
    }
    // Preserve dynamic segments like /en/tours/azerbaijan-week
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([k]) => !['locale'].includes(k))
        .map(([k, v]) => [k, String(v)]),
    )
    const qs = query.toString()
    router.push(`/${segments.join('/')}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={ta('changeLanguage')}
        className="flex h-10 items-center gap-1.5 rounded-full border border-ink-700 px-3.5 text-sm font-semibold text-ink-200 transition hover:border-ink-500 hover:text-white"
      >
        {LABELS[locale]}
        <span className="text-[0.6rem] text-ink-400">▼</span>
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-32 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchTo(l)}
                className={`block w-full px-4 py-3 text-left text-sm font-semibold transition ${
                  l === locale
                    ? 'bg-flame-500 text-white'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {l === 'en' ? 'English' : 'Русский'}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
