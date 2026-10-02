type Props = {
  items: string[]
}

/**
 * Infinite horizontal ticker. The list is rendered twice and translated by
 * -50%, so when it loops the copy is already in place.
 */
export default function Marquee({ items }: Props) {
  if (items.length === 0) return null
  const row = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-ink-800 bg-ink-900/60 py-5">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-ink-950 to-transparent" />

      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.28em] text-ink-300"
          >
            {item}
            <span className="text-flame-500">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
