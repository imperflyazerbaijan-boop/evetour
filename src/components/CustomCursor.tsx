'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/**
 * Custom cursor: a small solid dot that trails the pointer exactly, plus a
 * larger ring that lags behind with spring physics. The ring expands and
 * inverts over interactive elements. Disabled entirely on touch devices
 * and when the user prefers reduced motion.
 */
export default function CustomCursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = React.useState(false)
  const [variant, setVariant] = React.useState<'default' | 'hover' | 'view'>('default')
  const [label, setLabel] = React.useState('')
  const [down, setDown] = React.useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 })

  React.useEffect(() => {
    if (reduce) return
    // Only run on devices with a real pointer (mouse/trackpad)
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return
    setEnabled(true)

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)

      const target = e.target as HTMLElement | null
      const interactive = target?.closest(
        'a, button, [data-cursor="hover"], input, select, textarea',
      )
      const viewEl = target?.closest<HTMLElement>('[data-cursor="view"]')

      if (viewEl) {
        setVariant('view')
        setLabel(viewEl.dataset.cursorLabel ?? '')
      } else if (interactive) {
        setVariant('hover')
        setLabel('')
      } else {
        setVariant('default')
        setLabel('')
      }
    }

    const leave = () => {
      x.set(-100)
      y.set(-100)
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [reduce, x, y])

  if (!enabled) return null

  const ringSize = variant === 'view' ? 88 : variant === 'hover' ? 56 : 34

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden lg:block" aria-hidden>
      {/* Trailing ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          translateX: '-50%',
          translateY: '-50%',
          borderColor:
            variant === 'view' ? 'var(--brand-accent)' : 'rgba(255,255,255,0.55)',
          backgroundColor:
            variant === 'view'
              ? 'var(--brand-accent)'
              : variant === 'hover'
                ? 'rgba(255,255,255,0.08)'
                : 'transparent',
          scale: down ? 0.85 : 1,
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          borderColor:
            variant === 'view'
              ? 'var(--brand-accent)'
              : 'rgba(255,255,255,0.55)',
          backgroundColor:
            variant === 'view'
              ? 'var(--brand-accent)'
              : variant === 'hover'
                ? 'rgba(255,255,255,0.08)'
                : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {label ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity:  1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold uppercase tracking-[0.15em] text-ink-950"
          >
            {label}
          </motion.span>
        ) : null}
      </motion.div>

      {/* Precise dot */}
      <motion.div
        className="absolute rounded-full bg-flame-500"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: variant === 'view' ? 0 : 1,
          width: variant === 'hover' ? 4 : 6,
          height: variant === 'hover' ? 4 : 6,
        }}
        transition={{ duration: 0.18 }}
      />
    </div>
  )
}
