'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from 'motion/react'

export type ReviewCard = {
  id: string
  author: string
  country: string | null
  rating: number
  text: string
  tourTitle: string
  avatar: string | null
  image: string | null
}

type Props = {
  reviews: ReviewCard[]
  emptyTitle: string
  emptyHint: string
  dragLabel: string
}

const CARD_W = 400
const GAP = 28
const step = CARD_W + GAP

/**
 * Infinite right-to-left marquee of review cards.
 *
 * The track renders the list twice and is translated by exactly one set
 * width over a full cycle, so when it wraps the duplicate is already in
 * place — no visible jump. Drag scrubs the offset manually.
 */
export default function ReviewsCarousel({
  reviews,
  emptyTitle,
  emptyHint,
  dragLabel,
}: Props) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const [paused, setPaused] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (paused) return
    const half = step * reviews.length
    if (half === 0) return
    const current = -baseX.get()
    let next = current + 0.55 * (delta / 16.67)
    next = next % half
    baseX.set(-next)
  })

  const x = useTransform(baseX, (v) => v)

  // Drag to scrub
  const [dragStart, setDragStart] = React.useState<number | null>(null)
  const [dragBase, setDragBase] = React.useState(0)

  const onPointerDown = (e: React.PointerEvent) => {
    setPaused(true)
    setDragStart(e.clientX)
    setDragBase(baseX.get())
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart === null) return
    baseX.set(dragBase + (e.clientX - dragStart))
  }
  const onPointerUp = () => {
    setDragStart(null)
    setPaused(false)
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink-700 bg-ink-900/50 px-8 py-16 text-center">
        <p className="display-md text-ink-200">{emptyTitle}</p>
        <p className="mx-auto mt-4 max-w-md text-ink-400">{emptyHint}</p>
      </div>
    )
  }
  return (
    <div className="relative">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="cursor-grab overflow-hidden py-4 active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
      >
        <motion.div className="flex w-max" style={{ x }}>
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex shrink-0"
              aria-hidden={dup === 1}
              style={{ gap: GAP }}
            >
              {reviews.map((r) => (
                <article
                  key={`${dup}-${r.id}`}
                  style={{ width: CARD_W }}
                  className="group relative flex shrink-0 flex-col overflow-hidden rounded-3xl border border-ink-700 bg-ink-900 transition-colors duration-500 hover:border-flame-500/60"
                >
                  {/*
                    Only a real guest photo is shown here. Without one the card
                    falls back to a thin brand gradient rather than sitting as
                    a bare text block, so the carousel still reads as a set.
                  */}
                  {r.image ? (
                    <div className="relative h-56 shrink-0 overflow-hidden">
                      <Image
                        src={r.image}
                        alt={r.author}
                        fill
                        sizes="400px"
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
                    </div>
                  ) : (
                    <div
                      aria-hidden
                      className="h-1.5 shrink-0 bg-gradient-to-r from-flame-500/70 via-gold-500/50 to-caspian-600/70"
                    />
                  )}
                  <div className="relative flex flex-1 flex-col p-6">
                    <div className="mb-4 flex h-4 items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-base leading-none ${
                            i < r.rating ? 'text-brand-300' : 'text-ink-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <p className="flex-1 text-ink-300">"{r.text}"</p>

                    <div className="mt-6 flex items-center gap-3 border-t border-ink-700 pt-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-flame-500 to-gold-500 text-sm font-bold text-white">
                        {r.author.trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{r.author}</p>
                        <p className="truncate text-xs text-ink-400">
                          {[r.country, r.tourTitle].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent" />

      {!reduce ? (
        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-ink-500">
          {dragLabel}
        </p>
      ) : null}
    </div>
  )
}
