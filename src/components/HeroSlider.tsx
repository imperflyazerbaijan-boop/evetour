'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from 'motion/react'
import SplitText from './SplitText'
import { useTranslations } from 'next-intl'

export type SlideData = {
  id: string
  image: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  align: string
}

type Props = {
  slides: SlideData[]
  locale: string
  scrollLabel: string
}

/**
 * Full-bleed hero slider.
 *
 * - Slides cross-fade with a slow drift
 * - Headline animates word-by-word out of a mask (SplitText)
 * - A vertical index rail on the right doubles as navigation
 * - The whole layer drifts with the pointer (mouse parallax)
 * - Autoplay pauses on hover; arrow keys also navigate
 */
export default function HeroSlider({ slides, locale, scrollLabel }: Props) {
  const ta = useTranslations('a11y')
  const reduce = useReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const springX = useSpring(px, { stiffness: 60, damping: 20, mass: 0.6 })
  const springY = useSpring(py, { stiffness: 60, damping: 20, mass: 0.6 })

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce) return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    py.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  React.useEffect(() => {
    if (paused || reduce || slides.length < 2) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 6500)
    return () => clearInterval(id)
  }, [paused, reduce, slides.length])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIndex((i) => (i + 1) % slides.length)
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => (i - 1 + slides.length) % slides.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  if (slides.length === 0) return null
  const slide = slides[index]
  return (
    <section
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerMove={onPointerMove}
      aria-roledescription="carousel"
      aria-label={ta('featuredDestinations')}
    >
      {/* Slides */}
      <motion.div
        className="absolute inset-0"
        style={{ x: springX, y: springY }}
      >
        {slides.map((s, i) => (
          <motion.div
            key={s.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              scale: i === index ? 1 : 1.1,
            }}
            transition={{
              opacity: { duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: reduce ? 0 : 8, ease: 'linear' },
            }}
            aria-hidden={i !== index}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Cinematic overlays — three layers build depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/10 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink-950/85 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-28 sm:px-10 md:px-16 lg:px-24 lg:pb-36">
        <div className="max-w-5xl">
          <motion.p
            key={`eyebrow-${slide.id}`}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="eyebrow mb-6 flex items-center gap-4 text-ink-300"
          >
            <span className="inline-block h-px w-12 bg-flame-500" />
            {String(index + 1).padStart(2, '0')}
            <span className="text-ink-600">/</span>
            {String(slides.length).padStart(2, '0')}
          </motion.p>

          <SplitText
            key={`title-${slide.id}`}
            as="h1"
            text={slide.title}
            delay={0.15}
            className="display-xl block text-white"
          />

          <motion.p
            key={`sub-${slide.id}`}
            initial={reduce ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink-200 sm:text-xl"
          >
            {slide.subtitle}
          </motion.p>

          {slide.ctaLabel ? (
            <motion.div
              key={`cta-${slide.id}`}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-10"
            >
              <a
                href={slide.ctaHref}
                data-cursor="hover"
                className="glow-primary group inline-flex items-center gap-4 rounded-full bg-flame-500 px-9 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform duration-500 hover:scale-[1.03] hover:bg-flame-400"
              >
                {slide.ctaLabel}
                <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                  →
                </span>
              </a>
            </motion.div>
          ) : null}
        </div>
      </div>
      {/* Vertical index rail — doubles as navigation */}
      {slides.length > 1 ? (
        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group flex items-center gap-3"
            >
              <span
                className={`font-mono text-[0.6rem] tracking-widest transition-all duration-500 ${
                  i === index
                    ? 'text-white opacity-100'
                    : 'text-ink-500 opacity-0 group-hover:opacity-100'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={`block transition-all duration-500 ${
                  i === index
                    ? 'h-12 w-px bg-flame-500'
                    : 'h-6 w-px bg-ink-600 group-hover:bg-ink-400'
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-10 left-6 z-10 hidden items-center gap-4 text-ink-400 sm:flex lg:left-24"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="eyebrow">{scrollLabel}</span>
        <span className="h-px w-16 bg-ink-600" />
      </motion.div>
    </section>
  )
}

