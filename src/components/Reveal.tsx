'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

type Props = {
  children: React.ReactNode
  delay?: number
  y?: number
}

/** Fades and lifts children into view once they enter the viewport. */
export default function Reveal({ children, delay = 0, y = 34 }: Props) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
