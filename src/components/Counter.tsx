'use client'

import * as React from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

type Props = {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

/** Counts up to `value` once the element scrolls into view. */
export default function Counter({
  value,
  suffix = '',
  prefix = '',
  className = '',
  duration = 1.6,
}: Props) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  })

  React.useEffect(() => {
    if (inView && !reduce) {
      motionValue.set(value)
    } else if (inView && reduce) {
      motionValue.set(value)
    }
  }, [inView, value, reduce, motionValue])

  React.useEffect(() => {
    if (reduce) {
      // Skip the ticker entirely; write the final value once.
      if (ref.current) ref.current.textContent = `${prefix}${value}${suffix}`
      return
    }
    return spring.on('change', (latest: number) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`
      }
    })
  }, [spring, reduce, value, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {reduce ? value : 0}
      {suffix}
    </span>
  )
}
