'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'

type Props = {
  src: string
  alt: string
  className?: string
  /** Animation starts this far into the element's scroll range. */
  delay?: number
  sizes?: string
  priority?: boolean
  /** Adds a subtle parallax drift as the image passes through the viewport. */
  parallax?: boolean
  scale?: number
}

/**
 * Image that reveals itself behind a clip-path curtain when scrolled into
 * view, with an inner counter-scale so the photo appears to push through the
 * mask. Optionally drifts with scroll for depth.
 */
export default function ImageReveal({
  src,
  alt,
  className = '',
  delay = 0,
  sizes = '(max-width: 640px) 100vw, 50vw',
  priority = false,
  parallax = false,
  scale = 1.15,
}: Props) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Drift upward as the element travels through the viewport
  const drift = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  if (reduce) {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.1, delay, ease: [0.76, 0, 0.24, 1] }}
        style={parallax ? { y: drift } : undefined}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
