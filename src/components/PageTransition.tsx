'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'

/**
 * Route transition curtain: the outgoing page is covered by a panel that
 * wipes down, then retracts to reveal the next page. Award sites use this
 * instead of a blank flash between routes.
 */
export default function PageTransition() {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const [wipe, setWipe] = React.useState(false)
  const first = React.useRef(true)

  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (reduce) return
    setWipe(true)
    const id = setTimeout(() => setWipe(false), 900)
    return () => clearTimeout(id)
  }, [pathname, reduce])

  if (reduce) return null

  return (
    <AnimatePresence>
      {wipe ? (
        <motion.div
          key={pathname}
          className="pointer-events-none fixed inset-0 z-[95] flex items-end bg-ink-950 px-6 pb-10"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          transition={{
            duration: 0.55,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <motion.p
            className="font-display text-5xl uppercase text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
          >
            EVE
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
