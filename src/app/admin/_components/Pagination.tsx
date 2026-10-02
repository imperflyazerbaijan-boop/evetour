import Link from 'next/link'

/**
 * Works out which page to show and reports the numbers the <Pagination> links
 * need. Kept in one place so every list page agrees on what "page 3 of 9" means.
 *
 * Callers must do their own `skip`/`take` from the returned `current`, not from
 * the raw query string — that is what makes an out-of-range ?page=999 show the
 * last page instead of nothing.
 */
export function paginate(total: number, requested: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  // Clamp rather than trusting the query string.
  const current = Math.min(Math.max(1, Number.isFinite(requested) ? Math.trunc(requested) : 1), pages)
  return { total, pages, current, perPage }
}

/** Page numbers to show, with `null` standing in for a gap. */
function pageWindow(current: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const out: (number | null)[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(pages - 1, current + 1)
  if (start > 2) out.push(null)
  for (let i = start; i <= end; i++) out.push(i)
  if (end < pages - 1) out.push(null)
  out.push(pages)
  return out
}

/**
 * Numbered pagination. Every link keeps any other query params (so a
 * `?deleted=1` notice survives a page change) and only rewrites `page`.
 */
export function Pagination({
  current,
  pages,
  basePath,
  params = {},
}: {
  current: number
  pages: number
  basePath: string
  params?: Record<string, string | undefined>
}) {
  if (pages <= 1) return null

  const href = (p: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v)
    if (p > 1) q.set('page', String(p))
    const qs = q.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const cell =
    'rounded-lg border border-ink-700 px-3 py-1.5 text-sm font-semibold text-ink-200 transition-colors hover:border-flame-500 hover:text-white'
  const active = 'border-flame-500 bg-flame-500/15 text-flame-300'
  const disabled = 'pointer-events-none border-ink-800 text-ink-600'

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2 pt-2">
      <Link
        href={href(current - 1)}
        aria-disabled={current === 1}
        className={`${cell} ${current === 1 ? disabled : ''}`}
      >
        ← Prev
      </Link>

      {pageWindow(current, pages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-ink-600">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === current ? 'page' : undefined}
            className={`${cell} ${p === current ? active : ''}`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={href(current + 1)}
        aria-disabled={current === pages}
        className={`${cell} ${current === pages ? disabled : ''}`}
      >
        Next →
      </Link>
    </nav>
  )
}