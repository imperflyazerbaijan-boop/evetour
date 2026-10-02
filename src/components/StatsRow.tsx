'use client'

import Counter from './Counter'

type Stat = { value: number | null; text?: string; label: string }

type Props = {
  stats: Stat[]
}

/**
 * Numeric stats row. Numbers count up when scrolled into view; non-numeric
 * values (e.g. "No prepayment") render as text.
 */
export default function StatsRow({ stats }: Props) {
  if (stats.length === 0) return null

  return (
    <section className="border-b border-ink-800 bg-ink-950">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 px-6 sm:px-10 lg:grid-cols-4 lg:px-16">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-4 py-10 text-center ${i % 2 === 1 ? 'border-l border-ink-800' : ''} ${
              i >= 2 ? 'border-t border-ink-800 lg:border-t-0' : ''
            }`}
          >
            {s.value !== null ? (
              <Counter
                value={s.value}
                suffix="+"
                className="font-display text-4xl uppercase text-white sm:text-5xl"
              />
            ) : (
              <p className="font-display text-2xl uppercase text-white sm:text-3xl">
                {s.text}
              </p>
            )}
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.24em] text-ink-500">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
