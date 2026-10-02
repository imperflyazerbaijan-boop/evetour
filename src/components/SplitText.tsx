'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

type Props = {
  text: string
  className?: string
  delay?: number
  /** Rises from below a per-line mask, the classic editorial reveal. */
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * Splits text into words and animates each one up from behind an overflow
 * mask. This is the effect that separates editorial-grade hero headlines
 * from a plain fade-in. Preserves word wrapping and screen-reader order.
 */
export default function SplitText({
  text,
  className = '',
  delay = 0,
  as: Tag = 'span',
}: Props) {
  const reduce = useReducedMotion()
  const words = React.useMemo(
    () => text.split(' ').filter(Boolean),
    [text],
  )

  if (reduce) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          // Keeps the mask from clipping descenders on the last line
          style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.055,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
